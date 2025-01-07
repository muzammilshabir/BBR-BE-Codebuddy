import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from '../stripe/schema/invoice.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';
import { InvoiceItem } from 'src/stripe/schema/invoice-item.schema';
import { StripeService } from 'src/stripe/stripe.service';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { BespokeRequestFeature } from '../bespokeRequests/bespokeRequests.service';
import { InvoiceStatus } from 'src/stripe/enum/invoice-status.enum';
import { InvoiceSchedule } from 'src/invoice-schedule/invoiceSchedule.schema';
import { User } from 'src/users/schema/user.schema';
import { PaymentMethod } from 'src/stripe/schema/payment-method.schema';
import * as dayjs from 'dayjs';
import { PaymentAttempt } from 'src/stripe/schema/payment-attempt.schema';
import { PaymentAttemptStatus } from 'src/stripe/enum/payment-attempt-status.enum';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name) private readonly lineItemModel: Model<InvoiceItem>,
    private readonly stripeService: StripeService,

    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(PaymentMethod.name) private readonly paymentMethodModel: Model<PaymentMethod>,

    @InjectModel(PaymentAttempt.name) private readonly paymentAttemptModel: Model<PaymentAttempt>,

    @InjectModel(Plan.name) private readonly planModel: Model<Plan>
  ) {}

  async createInvoice() {
    return await this.invoiceModel.create({});
  }

  async getInvoiceById(id: string) {
    return await this.invoiceModel.findById(id);
  }

  async getStripeInvoiceById(invoiceId: string) {
    return await this.stripeService.getInvoiceFull(invoiceId);
  }

  async attachStripeInvoice(invoiceId: string, stripeInvoiceId: string, hostedInvoiceUrl?: string) {
    return await this.invoiceModel.findByIdAndUpdate(invoiceId, {
      stripeInvoiceId,
      ...(hostedInvoiceUrl ? { hostedInvoiceUrl } : {}),
    });
  }

  async createLineItemsFromRankingCategories(
    invoiceId: string,
    rankingCategories: RankingCategory[]
  ) {
    const lineItems = [];
    for (const rankingCategory of rankingCategories) {
      lineItems.push(
        await this.lineItemModel.create({
          invoiceId,
          name: rankingCategory.title,
          unitAmount: rankingCategory.price,
          totalAmount: rankingCategory.price,
        })
      );
    }
    return lineItems;
  }

  async createLineItemsFromFeatures(invoiceId: string, features: BespokeRequestFeature[]) {
    const lineItems = [];
    await this.lineItemModel.deleteMany({
      invoiceId,
    });
    for (const feature of features) {
      lineItems.push(
        await this.lineItemModel.create({
          invoiceId,
          name: feature.featureName,
          unitAmount: feature.monthlyPrice,
          totalAmount: feature.monthlyPrice,
        })
      );
    }
    return lineItems;
  }

  async attachLineItemsToStripeInvoice(
    stripeCustomerId: string,
    stripeInvoiceId: string,
    lineItems: InvoiceItem[]
  ) {
    for (const lineItem of lineItems) {
      const stripeProduct = await this.stripeService.createProduct(lineItem.name);

      const stripeLineItem = await this.stripeService.createInvoiceLineItem(
        stripeCustomerId,
        stripeProduct.id,
        lineItem.unitAmount,
        stripeInvoiceId
      );
      await this.lineItemModel.findByIdAndUpdate(lineItem.id, {
        stripeProductId: stripeProduct.id,
        stripeInvoiceLineItemId: stripeLineItem.id,
      });
    }
  }

  async updateLineItemsToStripeInvoice(
    stripeCustomerId: string,
    stripeInvoiceId: string,
    lineItems: InvoiceItem[]
  ) {
    try {
      // Remove existing line items from the Stripe invoice
      const stripeInvoice = await this.stripeService.getInvoiceFull(stripeInvoiceId);

      // Delete existing line items
      const existingLineItemPromises = stripeInvoice.lines.data.map((lineItem) =>
        this.stripeService.delLineItem(lineItem.id)
      );

      await Promise.all(existingLineItemPromises);

      for (const lineItem of lineItems) {
        const stripeProduct = await this.stripeService.createProduct(lineItem.name);

        const stripeLineItem = await this.stripeService.createInvoiceLineItem(
          stripeCustomerId,
          stripeProduct.id,
          lineItem.unitAmount,
          stripeInvoiceId
        );

        await this.lineItemModel.findByIdAndUpdate(lineItem.id, {
          stripeProductId: stripeProduct.id,
          stripeInvoiceLineItemId: stripeLineItem.id,
        });
      }
    } catch (error) {
      console.error('Error updating Stripe invoice line items:', error);
      throw error;
    }
  }

  async createLineItemsFromSubscriptionPlan(invoiceId: string, subscriptionPlan: Plan) {
    return await this.lineItemModel.create({
      invoiceId,
      name: subscriptionPlan.name,
      unitAmount: subscriptionPlan.name === 'Bespoke Residence Profile' ? 0 : subscriptionPlan.fee,
      totalAmount: subscriptionPlan.name === 'Bespoke Residence Profile' ? 0 : subscriptionPlan.fee,
    });
  }

  async createInvoiceFromSchedule(
    invoiceSchedule: InvoiceSchedule,
    issuedAt: Date,
    dueAt: Date,
    paymentMethodId: string
  ) {
    const invoice = await this.invoiceModel.create({
      residenceId: invoiceSchedule.residenceId,
      paymentMethodId,
      status: InvoiceStatus.PENDING,
      subscriptionId: invoiceSchedule.planId,
      issuedAt,
      dueAt,
      developerId: invoiceSchedule.developerId,
      nextAutoPaymentAttemptAt: dueAt,
      maxAutoPaymentAttemptsCount: invoiceSchedule.maxRenewalAttemptsCount,
      paymentFrequency: invoiceSchedule.attemptsFrequency,
      subTotal: 0,
      total: 0,
      discount: invoiceSchedule.discountAmount || 0,
      tax: invoiceSchedule.taxPercentage || 0,
    });

    const developer = await this.userModel.findById(invoiceSchedule.developerId);
    const stripeInvoice = await this.stripeService.createInvoiceV2(developer.stripeCustomerId);

    await this.createLineItemsFromScheduleFeatures(invoice.id, invoiceSchedule.features);
    const plan = await this.planModel.findById(invoiceSchedule.planId);
    await this.createLineItemsFromSubscriptionPlan(invoice.id, plan);

    const lineItems = await this.lineItemModel.find({ invoiceId: invoice.id });

    // Calculate amounts
    const subTotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const discountAmount = invoiceSchedule.discountAmount || 0;
    const taxAmount = ((subTotal - discountAmount) * (invoiceSchedule.taxPercentage || 0)) / 100;
    const total = subTotal - discountAmount + taxAmount;

    // Update invoice with calculated amounts
    await this.invoiceModel.findByIdAndUpdate(invoice.id, {
      subTotal,
      total,
      tax: taxAmount,
    });

    await this.attachLineItemsToStripeInvoice(
      developer.stripeCustomerId,
      stripeInvoice.id,
      lineItems
    );

    const finalStripeInvoice = await this.stripeService.finalizeInvoice(stripeInvoice);

    await this.attachStripeInvoice(
      invoice.id,
      stripeInvoice.id,
      finalStripeInvoice.hosted_invoice_url
    );

    return invoice;
  }

  private async createLineItemsFromScheduleFeatures(invoiceId: string, features: any[]) {
    const lineItems = [];
    for (const feature of features) {
      lineItems.push(
        await this.lineItemModel.create({
          invoiceId,
          name: feature.featureName,
          unitAmount: feature.unitAmount,
          totalAmount: feature.unitAmount,
        })
      );
    }

    return lineItems;
  }

  async attemptAutoPayment(invoice: Invoice) {
    const { autoPaymentAttemptsCount, maxAutoPaymentAttemptsCount } = invoice;
    try {
      const paymentMethod = await this.paymentMethodModel.findById(invoice.paymentMethodId);
      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }

      await this.paymentAttemptModel.create({
        invoiceId: invoice._id,
        paymentMethodId: invoice.paymentMethodId,
        stripeInvoiceId: invoice.stripeInvoiceId,
        status: PaymentAttemptStatus.PENDING,
        attemptNumber: 1,
        attemptsRemaining: 0,
        attemptsRemainingToday: 0,
      });

      await this.stripeService.payInvoiceUsingPaymentMethod(
        invoice.stripeInvoiceId,
        paymentMethod.paymentMethodId
      );

      await this.invoiceModel.findByIdAndUpdate(invoice.id, {
        autoPaymentAttemptsCount: autoPaymentAttemptsCount + 1,
        lastAutoPaymentAttemptedAt: new Date(),
        paymentAttempts: [
          ...invoice.paymentAttempts,
          {
            success: true,
            timestamp: new Date(),
            message: 'Payment successful',
          },
        ],
      });

      if (autoPaymentAttemptsCount + 1 >= maxAutoPaymentAttemptsCount) {
        await this.invoiceModel.findByIdAndUpdate(invoice.id, {
          status: InvoiceStatus.FAILED,
        });
      } else {
        const todayStartPST = dayjs().tz('Asia/Kolkata').startOf('day');
        const nextAutoPaymentAttemptAt = todayStartPST.add(invoice.paymentFrequency, 'days');
        await this.invoiceModel.findByIdAndUpdate(invoice.id, {
          nextAutoPaymentAttemptAt,
        });
      }
    } catch (error) {
      await this.invoiceModel.findByIdAndUpdate(invoice.id, {
        paymentAttempts: [
          ...invoice.paymentAttempts,
          {
            success: false,
            timestamp: new Date(),
            message: error.message,
          },
        ],
      });
      if (autoPaymentAttemptsCount + 1 >= maxAutoPaymentAttemptsCount) {
        await this.invoiceModel.findByIdAndUpdate(invoice.id, {
          status: InvoiceStatus.FAILED,
        });
      } else {
        const todayStartPST = dayjs().tz('Asia/Kolkata').startOf('day');
        const nextAutoPaymentAttemptAt = todayStartPST.add(invoice.paymentFrequency, 'days');
        await this.invoiceModel.findByIdAndUpdate(invoice.id, {
          nextAutoPaymentAttemptAt,
          autoPaymentAttemptsCount: autoPaymentAttemptsCount + 1,
          lastAutoPaymentAttemptedAt: new Date(),
        });
      }
    }
  }
}
