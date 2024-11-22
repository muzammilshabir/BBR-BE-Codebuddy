import { Injectable } from '@nestjs/common';
import { Invoice } from '../stripe/schema/invoice.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';
import { InvoiceItem } from 'src/stripe/schema/invoice-item.schema';
import { StripeService } from 'src/stripe/stripe.service';

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
}
