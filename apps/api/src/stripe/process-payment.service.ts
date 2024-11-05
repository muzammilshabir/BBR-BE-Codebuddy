import { Injectable, Logger } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import { StripeService } from './stripe.service';
import { ResidenceService } from 'src/residences/residences.service';
import { TransactionRepository } from './transaction.repository';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceItemRepository } from './invoice-item.repository';
import { SubscriptionRepository } from './subscription.repository';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { UserService } from 'src/users/user.service';
import { SubscriptionStatus } from './enum/subscription-status.enum';
import { InvoiceStatus } from './enum/invoice-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Interval } from './enum/interval.enum';
import { Invoice } from './schema/invoice.schema';
import { PaymentAttemptStatus } from './enum/payment-attempt-status.enum';
import { PaymentMethodRepository } from './payment-method.repository';

@Injectable()
export class ProcessPaymentService {
  private readonly logger = new Logger(ProcessPaymentService.name);
  constructor(
    private readonly configService: ServiceConfig,
    private readonly stripeService: StripeService,
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly transactionRepository: TransactionRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository
  ) {}

  private async getLatestSubscriptionInvoice(subscriptionId: string): Promise<Invoice> {
    const options = {
      limit: 1,
      offset: 0,
      sort: [['issuedAt', -1]],
    };
    return (await this.invoiceRepository.findAll({ subscriptionId }, options)).data[0];
  }

  private differenceInDays(date1: Date, date2: Date): number {
    const differenceInTime = date2.getTime() - date1.getTime();
    return Math.round(differenceInTime / (1000 * 3600 * 24));
  }

  private billingCycle(recurring: { interval: Interval; interval_count: number }): number {
    const now = new Date();
    const futureDate = new Date(now);
  
    switch (recurring.interval) {
      case Interval.DAY:
        futureDate.setDate(now.getDate() + recurring.interval_count);
        break;
      case Interval.WEEK:
        futureDate.setDate(now.getDate() + (7 * recurring.interval_count));
        break;
      case Interval.MONTH:
        futureDate.setMonth(now.getMonth() + recurring.interval_count);
        break;
      case Interval.YEAR:
        futureDate.setFullYear(now.getFullYear() + recurring.interval_count);
        break;
      default:
        throw new Error(`Unsupported interval: ${recurring.interval}`);
    }

    const differenceInTime = futureDate.getTime() - now.getTime();
    return Math.round(differenceInTime / (1000 * 3600 * 24));
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async createPendingInvoices() {
    this.logger.log('Starting createPendingInvoices cron job');
    const subscriptions = await this.subscriptionRepository.findAll({
      status: SubscriptionStatus.ACTIVE,
    });
    for (const subscription of subscriptions.data) {
      this.logger.log(`Processing subscription: ${subscription.id}`);
      const baseInvoice = await this.invoiceRepository.findOne(
        subscription.baseInvoiceId.toString()
      );
      if (baseInvoice.status !== InvoiceStatus.PAID) {
        continue;
      }
      let latestInvoice = await this.getLatestSubscriptionInvoice(subscription.id);
      if (!latestInvoice) {
        latestInvoice = baseInvoice;
      }
      if (latestInvoice.status !== InvoiceStatus.PAID) {
        continue;
      }
      const lastInvoiceIssuedDaysAgo = this.differenceInDays(
        new Date(latestInvoice.issuedAt),
        new Date()
      );
      const subscriptionsBillingCycle = this.billingCycle(subscription.recurring);
      if (lastInvoiceIssuedDaysAgo < subscriptionsBillingCycle) {
        this.logger.log(`Skipping subscription ${subscription.id}: Not due for new invoice yet`);
        continue;
      }
      const latestInvoiceItems = await this.invoiceItemRepository.findByInvoiceId(latestInvoice.id);
      const newInvoice = {
        membershipType: latestInvoice.membershipType,
        paymentMethodId: latestInvoice.paymentMethodId,
        discount: latestInvoice.discount,
        tax: latestInvoice.tax,
        note: latestInvoice.note,
        status: InvoiceStatus.PENDING,
        subscriptionId: subscription.id,
        issuedAt: new Date(),
        dueAt: new Date(new Date().setDate(new Date().getDate() + subscriptionsBillingCycle)),
        developerId: latestInvoice.developerId,
        createdById: latestInvoice.createdById,
      };
      const upcomingInvoice = await this.invoiceRepository.create(newInvoice);
      this.logger.log(`Created new pending invoice: ${upcomingInvoice.id}`);
      for (const invoiceItem of latestInvoiceItems) {
        await this.invoiceItemRepository.create({
          invoiceId: upcomingInvoice.id,
          stripeProductId: invoiceItem.stripeProductId,
          feature: invoiceItem.feature,
          plan: invoiceItem.plan,
          quantity: invoiceItem.quantity,
          createdById: invoiceItem.createdById,
        });
      }
    }
    this.logger.log('Finished createPendingInvoices cron job');
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async processPendingInvoices() {
    try {
      this.logger.log('Starting processPendingInvoices cron job');
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);

      const invoices = await this.invoiceRepository.findAll({
        dueAt: { $lte: dueDate },
        status: InvoiceStatus.PENDING,
      });
      this.logger.log(`Found ${invoices.data.length} pending invoices due within 10 days`);

      for (const invoice of invoices.data) {
        try {
          this.logger.log(`Processing invoice: ${invoice.id}`);
          const requiredProperties = ['developerId', 'paymentMethodId', 'id'];
          const missingProperties = requiredProperties.filter((prop) => !invoice[prop]);

          if (missingProperties.length > 0) {
            this.logger.warn(
              `Invoice ${invoice.id} is missing required properties: ${missingProperties.join(', ')}`
            );
            await this.invoiceRepository.update(invoice.id, { status: InvoiceStatus.FAILED });
            this.logger.log(`Marked invoice ${invoice.id} as failed due to missing properties`);
            continue;
          }
          const paymentMethod = await this.paymentMethodRepository.findByStripePaymentMethodId(
            invoice.paymentMethodId
          );
          if (!paymentMethod) {
            this.logger.warn(
              `Invoice ${invoice.id} has an invalid payment method: ${invoice.paymentMethodId}, it lacks a mandateId`
            );
            await this.invoiceRepository.update(invoice.id, { status: InvoiceStatus.FAILED });
            this.logger.log(`Marked invoice ${invoice.id} as failed due to invalid payment method`);
            continue;
          }
          // const mandateId = paymentMethod.mandateId;

          const developer = await this.userService.findById(invoice.developerId.toString());
          const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(
            invoice.id.toString()
          );
          const invoiceSubscription = await this.subscriptionRepository.findByInvoiceId(
            invoice.id.toString()
          );
          const paymentAttempts = await this.paymentAttemptRepository.findByInvoiceId(
            invoice.id.toString()
          );

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const attemptsToday = paymentAttempts.filter(
            (attempt) => new Date(attempt.createdAt) >= today
          ).length;

          const totalAttemptsMade = paymentAttempts.length;

          let maxTotalAttempts = 3;
          let maxAttemptsPerDay = 1;

          if (invoiceSubscription) {
            maxTotalAttempts = invoiceSubscription.renewalAttempts;
            maxAttemptsPerDay = invoiceSubscription.attemptsFrequency;
          }

          const canAttemptToday = attemptsToday < maxAttemptsPerDay;
          const canAttemptTotal = totalAttemptsMade < maxTotalAttempts;

          if (canAttemptToday && canAttemptTotal) {
            const latestAttempt = paymentAttempts[paymentAttempts.length - 1];
            if (!latestAttempt || latestAttempt.status !== PaymentAttemptStatus.PENDING) {
              this.logger.log(`Creating new payment attempt for invoice: ${invoice.id}`);
              const productIds = invoiceItems.map((item) => item.stripeProductId.toString());
              const stripeInvoice = await this.stripeService.createInvoice(
                developer.stripeCustomerId,
                productIds,
                invoice.paymentMethodId,
                invoice.discount,
                invoice.tax
              );
              const createPaymentAttempt = {
                invoiceId: invoice.id,
                paymentMethodId: invoice.paymentMethodId,
                stripeInvoiceId: stripeInvoice.id,
                status: PaymentAttemptStatus.PENDING,
                attemptNumber: totalAttemptsMade + 1,
                attemptsRemaining: maxTotalAttempts - (totalAttemptsMade + 1),
                attemptsRemainingToday: maxAttemptsPerDay - (attemptsToday + 1),
                createdAt: new Date(),
              };
              await this.paymentAttemptRepository.create(createPaymentAttempt);
              this.logger.log(`Created new payment attempt for invoice: ${invoice.id}`);
            } else {
              this.logger.log(`Skipping invoice ${invoice.id}: Latest attempt is still pending`);
            }
          } else {
            this.logger.log(`Skipping invoice ${invoice.id}: Daily or total attempt limit reached`);
          }
        } catch (error) {
          this.logger.error(`Error processing invoice ${invoice.id}:`, error.stack);
        }
      }
    } catch (error) {
      this.logger.error('Error in processPendingInvoices:', error.stack);
    }
    this.logger.log('Finished processPendingInvoices cron job');
  }
}
