import { Injectable } from '@nestjs/common';
import { Invoice } from '../stripe/schema/invoice.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';
import { InvoiceItem } from 'src/stripe/schema/invoice-item.schema';
import { StripeService } from 'src/stripe/stripe.service';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { BespokeRequestFeature } from '../bespokeRequests/bespokeRequests.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name) private readonly lineItemModel: Model<InvoiceItem>,
    private readonly stripeService: StripeService
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

  async attachStripeInvoice(invoiceId: string, stripeInvoiceId: string) {
    return await this.invoiceModel.findByIdAndUpdate(invoiceId, { stripeInvoiceId });
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
}
