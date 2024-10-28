import { Injectable } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { CustomerDto } from './dto/customer.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { ResidenceService } from 'src/residences/residences.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { uuid } from 'short-uuid';
import { PaymentMethodRepository } from './payment-method.repository';
interface PaymentMethodType {
  id: string,
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
    private readonly residenceService: ResidenceService,
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {
    this.stripe = new Stripe(configService.stripe.secretKey, {
      typescript: true,
    });
  }

  private mapPaymentMethodToType(method: Stripe.PaymentMethod): PaymentMethodType {
    switch (method.type) {
      case 'card':
        return {
          id: method.id,
          type: 'card',
          brand: method.card.brand,
          last4: method.card.last4,
        };
      case 'paypal':
        return {
          id: method.id,
          type: 'paypal',
          email: method.paypal.payer_email,
        };
      case 'us_bank_account':
        return {
          id: method.id,
          type: 'wire',
          bank_name: method.us_bank_account.bank_name,
        };
      default:
        return {
          id: method.id,
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

  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethodType[]> {
    const paymentMethods = await this.stripe.customers.listPaymentMethods(customerId);
    const parsedMethods = [];
    for (const method of paymentMethods.data) {
      parsedMethods.push(this.mapPaymentMethodToType(method));
    }
    return parsedMethods;
  }

  async createSetupIntent(customerId: string) {
    return await this.stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
    });
  }

  async deletePaymentMethod(customerId: string, methodId: string) {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
    });
    let methodBelongsToCustomer = false;
    for (const paymentMethod of paymentMethods.data) {
      if (paymentMethod.id == methodId) {
        methodBelongsToCustomer = true;
        break;
      }
    }
    if (!methodBelongsToCustomer) {
      throw new Error('Invalid payment method id');
    }
    return this.stripe.paymentMethods.detach(methodId);
  }

  async retrieveCustomerPaymentMethod(customerId: string, paymentMethodId: string) {
    const paymentMethod = await this.stripe.customers.retrievePaymentMethod(
      customerId,
      paymentMethodId
    );
    return this.mapPaymentMethodToType(paymentMethod);
  }

  async getPrice(priceId: string): Promise<Stripe.Price> {
    return this.stripe.prices.retrieve(priceId);
  }

  async getProduct(id: string): Promise<Stripe.Product> {
    return this.stripe.products.retrieve(id);
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

  async createInvoice(customerId: string, productIds: string[], paymentMethodId: string, discount: number, tax: number) {
    const coupon = await this.stripe.coupons.create({
      name: uuid(),
      amount_off: discount,
      currency: 'usd',
    });
    const taxRate = await this.stripe.taxRates.create({
      display_name: uuid(),
      inclusive: false,
      percentage: tax,
    });
    const paymentMethod = await this.paymentMethodRepository.findByStripePaymentMethodId(paymentMethodId);
    const mandateId = paymentMethod.mandateId;
    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
      auto_advance: true,
      discounts: [{
        coupon: coupon.id, 
      }],
      default_tax_rates: [taxRate.id],
      payment_settings: {
        default_mandate: mandateId,
      },
    });
    for (const Id of productIds) {
      const product = await this.stripe.products.retrieve(Id);
      const price = product.default_price.toString();
      await this.stripe.invoiceItems.create({
        customer: customerId,
        price: price,
        quantity: 1,
        invoice: invoice.id,
      });
    }
    const fInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
    return {
      id: fInvoice.id,
      amount: fInvoice.amount_due,
      customer: fInvoice.customer_name,
      customer_email: fInvoice.customer_email,
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
        quantity: 1,
        subscription: residence.subscriptionId,
      });
    }

    return { products };
  }

  async createProducts(lineItems: PaymentLineItemDto[]): Promise<Stripe.Product[]> {
    const products = [];
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
    }

    return products;
  }

  async updateProduct(id: string, updateProduct: UpdateInvoiceItemDto) {
    const updateData: Partial<Stripe.ProductUpdateParams> = {};
    if(updateProduct.name) updateData.name = updateProduct.name;
    if(updateProduct.description) updateData.description = updateProduct.description;
    if(updateProduct.price) {
      const price = await this.stripe.prices.create({
        currency: 'usd',
        unit_amount: updateProduct.price,
        product: id,
      });
      updateData.default_price = price.id;
    }
    if(Object.keys(updateData).length > 0) {
      return this.stripe.products.update(id, updateData);
    }
    return this.stripe.products.retrieve(id);
  }
}
