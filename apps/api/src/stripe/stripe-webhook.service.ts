import { Injectable, RawBodyRequest } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { ResidenceService } from 'src/residences/residences.service';
interface InvoiceItem {
  name: string;
  residenceId: string;
  type: 'listing' | 'ranked' | 'featured';
}
@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ServiceConfig,
    private readonly stripeService: StripeService,
    private readonly residenceService: ResidenceService,
  ) {
    this.stripe = new Stripe(configService.stripe.secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  private async parseInvoiceLineItems(items: Stripe.InvoiceLineItem[]) {
    const parsedItems: InvoiceItem[] = [];
    for (const item of items) {
      const product = await this.stripeService.getStripeProduct(item.price.product.toString());
      parsedItems.push({
        name: product.name,
        residenceId: product.metadata.id,
        type: product.metadata.type as any,
      });
    }

    return parsedItems;
  }

  async handleWebhooks(request: RawBodyRequest<Request>) {
    
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    
    const event = this.stripe.webhooks.constructEvent(
      request.rawBody,
      signature,
      this.configService.stripe.webhookSecret,
    );
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'invoice.paid':
        const invoice = (event.data.object as Stripe.Invoice);
        await this.handleInvoicePaid(invoice);
        return invoice;
        break;
      default:
        // Unexpected event type
        console.error(`Unhandled event type ${event.type}.`);
    }

    return;
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const items = await this.parseInvoiceLineItems(invoice.lines.data);
    for (const item of items) {
      switch (item.type) {
        case 'listing':
          await this.handleListingPayment(item);
          break;
        case 'ranked':
          await this.handleRankedPayment(item);
          break;
        case 'featured':
          await this.handleFeaturedPayment(item);
          break;
            
        default:
          break;
      }
    }
  }

  async handleListingPayment(item: InvoiceItem) {
    return this.residenceService.upgradeResidence(item.residenceId);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleRankedPayment(_item: InvoiceItem) {
    // TODO: Ranked Listing flow has not been created yet, so unable to handle its payment
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleFeaturedPayment(_item: InvoiceItem) {
    // TODO: Featured Listing flow has not been created yet, so unable to handle its payment
  }
}
