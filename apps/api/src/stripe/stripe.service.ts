import { Injectable } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { CustomerDto } from './dto/customer.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { SubscriptionLineItemDto } from './dto/subscription-line-item.dto';
import { ResidenceService } from 'src/residences/residences.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
interface PaymentMethodType {
  type: string;
  brand?: string;
  last4?: string;
  email?: string;
  bank_name?: string;
}
@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ServiceConfig,
    private readonly residenceService: ResidenceService
  ) {
    this.stripe = new Stripe(configService.stripe.secretKey, {
      typescript: true,
    });
  }

  private mapPaymentMethodToType(method: Stripe.PaymentMethod): PaymentMethodType {
    switch (method.type) {
      case 'card':
        return {
          type: 'card',
          brand: method.card.brand,
          last4: method.card.last4,
        };
      case 'paypal':
        return {
          type: 'paypal',
          email: method.paypal.payer_email,
        };
      case 'us_bank_account':
        return {
          type: 'wire',
          bank_name: method.us_bank_account.bank_name,
        };
      default:
        return {
          type: method.type,
        };
    }
  }

  private parseInvoiceLineItems(items: Stripe.InvoiceLineItem[]) {
    const parsedItems = [];
    for (const item of items) {
      parsedItems.push({
        description: item.description,
        amount: item.amount,
        currency: item.currency,
        type: item.type,
      });
    }

    return parsedItems;
  }

  async createCustomer(customer: CustomerDto): Promise<Stripe.Customer> {
    return this.stripe.customers.create(customer);
  }

  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    const parsedEmail = email.replace(/["']/g, '');
    const searchResult = await this.stripe.customers.search({
      query: `email:"${parsedEmail}"`,
    });
    return searchResult.data[0] || null;
  }

  async getCustomerByStripeId(
    customerId: string
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return this.stripe.customers.retrieve(customerId);
  }
  async listCustomers(): Promise<Stripe.Customer[]> {
    return (await this.stripe.customers.list()).data;
  }

  async getInvoice(invoiceId: string) {
    const invoiceData = await this.stripe.invoices.retrieve(invoiceId);
    return {
      web: invoiceData.hosted_invoice_url,
      pdf: invoiceData.invoice_pdf,
    };
  }

  async getCustomerPaymentMethods(customerId: string) {
    const paymentMethods = await this.stripe.customers.listPaymentMethods(customerId);
    const parsedMethods = [];
    for (const method of paymentMethods.data) {
      parsedMethods.push(this.mapPaymentMethodToType(method));
    }
    return parsedMethods;
  }

  async changeSubscriptionPaymentMethod(
    customerId: string,
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<Stripe.Subscription> {
    const subs = await this.stripe.subscriptions.list({
      customer: customerId,
    });
    let subBelongsToCustomer = false;
    for (const sub of subs.data) {
      if (sub.id == subscriptionId) {
        subBelongsToCustomer = true;
        break;
      }
    }
    if (!subBelongsToCustomer) {
      throw new Error('Invalid sub id');
    }
    return this.stripe.subscriptions.update(subscriptionId,
      {
        default_payment_method: paymentMethodId,
      }
    );
  }

  async retrieveCustomerPaymentMethod(customerId: string, paymentMethodId: string) {
    const paymentMethod = await this.stripe.customers.retrievePaymentMethod(
      customerId,
      paymentMethodId
    );
    return this.mapPaymentMethodToType(paymentMethod);
  }

  async getStripeProduct(productId: string) {
    return this.stripe.products.retrieve(productId);
  }

  async processListItems(data: Stripe.InvoiceLineItem[] | Stripe.SubscriptionItem[]) {
    const parsedItems = [];
    for (const item of data) {
      const product = await this.getStripeProduct(item.price.product.toString());
      const parsedItem: any = {
        name: product.name,
        description: product.description,
        price: item.price.unit_amount,
      };
      if (item.price.recurring) {
        parsedItem.interval = item.price.recurring.interval;
        parsedItem.interval_count = item.price.recurring.interval_count;
      }
      parsedItems.push(parsedItem);
    }
    return parsedItems;
  }

  async getCustomerInvoices(customerId: string) {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
    });

    return invoices.data;
  }

  async getCustomerInvoice(customerId: string, invoiceId: string) {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
    });
    let invoiceBelongsToCustomer = false;
    for (const invoice of invoices.data) {
      if (invoice.id == invoiceId) {
        invoiceBelongsToCustomer = true;
        break;
      }
    }
    if (!invoiceBelongsToCustomer) {
      throw new Error('Invalid invoice id');
    }
    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    return this.processInvoice(invoice);
  }

  async getCustomerInvoiceAdmin(invoiceId: string) {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    return this.processInvoice(invoice);
  }

  async processInvoice(invoice: Stripe.Invoice) {
    const items = invoice.lines.data;
    const products = [];
    const subscriptions = [];
    for (const item of items) {
      const product = await this.stripe.products.retrieve(item.price.product.toString());
      if (item.type == 'subscription') {
        subscriptions.push({
          id: product.id,
          name: product.name,
          quantity: item.quantity,
          amount: item.amount,
        });
      } else {
        products.push({
          id: product.id,
          name: product.name,
          quantity: item.quantity,
          amount: item.amount,
        });
      }
    }
    return {
      status: invoice.status,
      due: invoice.due_date,
      subscriptions,
      products,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
    };
  }

  async refundInvoice(invoiceId: string, refundPaymentDto: RefundPaymentDto) {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    if (invoice.amount_paid < refundPaymentDto.amount) {
      throw new Error('Invalid refund amount');
    }
    const refund = await this.stripe.refunds.create({
      payment_intent: invoice.payment_intent.toString(),
      reason: 'requested_by_customer',
      amount: refundPaymentDto.amount,
      metadata: {
        note: refundPaymentDto.note,
        reason: refundPaymentDto.reason,
      },
    });

    return {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
      receipt_number: refund.receipt_number,
      failure_reason: refund.failure_reason,
      note: refundPaymentDto.note,
      reason: refundPaymentDto.reason,
      created: refund.created,
    };
  }

  async getCustomerSubscriptions(customerId: string) {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
    });
    const parsedSubscriptions = [];
    for (const subscription of subscriptions.data) {
      const lineItems = await this.processListItems(subscription.items.data);
      const paymentMethod = await this.retrieveCustomerPaymentMethod(
        customerId,
        subscription.default_payment_method.toString()
      );
      parsedSubscriptions.push({
        currency: subscription.currency,
        status: subscription.status,
        latest_invoice: subscription.latest_invoice,
        payment_method: paymentMethod,
        line_items: lineItems,
        start_date: subscription.start_date,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        canceled_at: subscription.canceled_at,
        created: subscription.created,
      });
    }
    return parsedSubscriptions;
  }

  async getCustomerPayments(customerId: string) {
    const payments = await this.stripe.paymentIntents.list({
      customer: customerId,
      expand: ['data.invoice', 'data.payment_method'],
    });
    const parsedPayments = [];
    for (const payment of payments.data) {
      parsedPayments.push({
        currency: payment.currency,
        amount: payment.amount,
        description: payment.description,
        status: payment.status,
        items: await this.processListItems((payment.invoice as Stripe.Invoice).lines.data),
        payment_method: this.mapPaymentMethodToType(payment.payment_method as Stripe.PaymentMethod),
        invoice: {
          invoiceId: (payment.invoice as Stripe.Invoice).id,
          web: (payment.invoice as Stripe.Invoice).hosted_invoice_url,
          pdf: (payment.invoice as Stripe.Invoice).invoice_pdf,
        },
        canceled_at: payment.canceled_at,
      });
    }

    return parsedPayments;
  }

  async createSubscriptionInvoice(customerId: string, lineItems: SubscriptionLineItemDto[]) {
    const parsedItems = [];
    for (const lineItem of lineItems) {
      const product = await this.stripe.products.create({
        name: lineItem.price_data.product_data.name,
        description: lineItem.price_data.product_data.description,
        default_price_data: {
          currency: lineItem.price_data.currency,
          unit_amount: lineItem.price_data.unit_amount,
          recurring: lineItem.price_data.recurring,
        },
        metadata: lineItem.price_data.product_data.metadata,
      });
      parsedItems.push({
        price_data: {
          product: product.id,
          currency: lineItem.price_data.currency,
          unit_amount: lineItem.price_data.unit_amount,
          recurring: lineItem.price_data.recurring,
        },
        quantity: lineItem.quantity,
      });
    }
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      payment_behavior: 'default_incomplete',
      collection_method: 'charge_automatically',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      items: parsedItems,
    });
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    return {
      amount: invoice.amount_due,
      customer: invoice.customer_name,
      customer_email: invoice.customer_email,
      items: this.parseInvoiceLineItems(invoice.lines.data),
      client_secret: (invoice.payment_intent as Stripe.PaymentIntent).client_secret,
    };
  }

  async createPaymentInvoice(
    customerId: string,
    residenceId: string,
    lineItems: PaymentLineItemDto[]
  ) {
    const products = [];
    const residence = await this.residenceService.getResidenceById(residenceId);
    for (const lineItem of lineItems) {
      const product = await this.stripe.products.create({
        name: lineItem.price_data.product_data.name,
        description: lineItem.price_data.product_data.description,
        default_price_data: {
          currency: lineItem.price_data.currency,
          unit_amount: lineItem.price_data.unit_amount,
        },
        metadata: lineItem.price_data.product_data.metadata,
      });
      products.push(product);
      await this.stripe.invoiceItems.create({
        customer: customerId,
        price_data: {
          product: product.id,
          currency: lineItem.price_data.currency,
          unit_amount: lineItem.price_data.unit_amount,
        },
        quantity: lineItem.quantity,
        subscription: residence.subscriptionId,
      });
    }

    return { products };
  }

  async createSubscriptionSession(customerId: string, lineItems: SubscriptionLineItemDto[]) {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'subscription',
      success_url: this.configService.stripe.successPage,
      cancel_url: this.configService.stripe.cancelPage,
    });

    return {
      amount: session.amount_total,
      customer: session.customer_details,
      url: session.url,
    };
  }

  async createPaymentSession(customerId: string, lineItems: PaymentLineItemDto[]) {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'payment',
      invoice_creation: {
        enabled: true,
      },
      success_url: this.configService.stripe.successPage,
      cancel_url: this.configService.stripe.cancelPage,
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
    });

    return {
      amount: session.amount_total,
      customer: session.customer_details,
      url: session.url,
    };
  }

  async createCustomerPortalSession(customerId: string) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: this.configService.stripe.redirectPage,
    });
    return {
      customer: session.customer,
      url: session.url,
    };
  }
}
