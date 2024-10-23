import { Injectable } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
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
import { Cron } from '@nestjs/schedule';
import { Interval } from './enum/interval.enum';

@Injectable()
export class ProcessPaymentService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ServiceConfig,
    private readonly stripeService: StripeService,
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly transactionRepository: TransactionRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository
  ) {}

  private async getLatestSubscriptionInvoice(subscriptionId: string) {
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
    const intervalToDaysMap = {
      [Interval.DAY]: 1,
      [Interval.WEEK]: 7,
      [Interval.MONTH]: 30,
      [Interval.YEAR]: 365,
    };
    return intervalToDaysMap[recurring.interval] * recurring.interval_count;
  }

  @Cron('0 6 * * *')
  async createPendingInvoices() {
    const subscriptions = await this.subscriptionRepository.findAll({
      status: SubscriptionStatus.ACTIVE,
    });
    for (const subscription of subscriptions.data) {
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
      const lastInvoiceIssuedDaysAgo = this.differenceInDays(new Date(latestInvoice.issuedAt), new Date());
      const subscriptionsBillingCycle = this.billingCycle(subscription.recurring);
      if (lastInvoiceIssuedDaysAgo < subscriptionsBillingCycle) {
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
        issuedAt: new Date,
        dueAt: new Date(new Date().setDate((new Date).getDate() + subscriptionsBillingCycle)),
        developerId: latestInvoice.developerId,
        createdById: latestInvoice.createdById,
      };
      const upcomingInvoice = await this.invoiceRepository.create(newInvoice);
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
  }

  @Cron('0 */4 * * *')
  async processPendingInvoices() {
    const invoices = await this.invoiceRepository.findAll({
      dueBy: { $lte: new Date() },
      status: InvoiceStatus.PENDING,
    });

    for (const invoice of invoices.data) {
      const developer = await this.userService.findById(invoice.developerId.toString());
      const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoice.id.toString());
      const paymentAttempts = await this.paymentAttemptRepository.findByInvoiceId(
        invoice.id.toString()
      );
      if (paymentAttempts.length === 0) {
        const invoiceSubscription = await this.subscriptionRepository.findByInvoiceId(invoice.id.toString());
        const productIds = invoiceItems.map((item) => item.stripeProductId.toString());
        const stripeInvoice = await this.stripeService.createInvoice(
          developer.stripeCustomerId,
          productIds,
          invoice.paymentMethodId,
          invoice.discount,
          invoice.tax,
        );
        const createPaymentAttempt = {
          invoiceId: invoice.id,
          paymentMethodId: invoice.paymentMethodId,
          stripeInvoiceId: stripeInvoice.id,
          status: 'pending',
          attemptNumber: 1,
          attemptsRemaining: invoiceSubscription.renewalAttempts - 1,
          attemptsRemainingToday: invoiceSubscription.attemptsFrequency - 1,
        };
        await this.paymentAttemptRepository.create(createPaymentAttempt);
      }
    }
  }
}
