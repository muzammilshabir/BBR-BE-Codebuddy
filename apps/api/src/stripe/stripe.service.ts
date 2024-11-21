import { Injectable } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { CustomerDto } from './dto/customer.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { ResidenceService } from 'src/residences/residences.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { uuid } from 'short-uuid';
export interface PaymentMethodType {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  email?: string;
  bank_name?: string;
  exp_month?: number;
  exp_year?: number;
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
          id: method.id,
          type: 'card',
          brand: method.card.brand,
          last4: method.card.last4,
          exp_month: method.card.exp_month,
          exp_year: method.card.exp_year,
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

  async getInvoiceFull(invoiceId: string) {
    return await this.stripe.invoices.retrieve(invoiceId);
  }

  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethodType[]> {
    const paymentMethods = await this.stripe.customers.listPaymentMethods(customerId);
    const parsedMethods = [];
    for (const method of paymentMethods.data) {
      parsedMethods.push(this.mapPaymentMethodToType(method));
    }
    return parsedMethods;
  }

  async createSetupIntent(
    customerId: string,
    paymentMethodId: string,
    ip: string,
    userAgent: string
  ) {
    try {
      const confirmedIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
        usage: 'off_session',
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
        },
        return_url: this.configService.stripe.redirectPage,
        mandate_data: {
          customer_acceptance: {
            type: 'online',
            online: {
              ip_address: ip,
              user_agent: userAgent,
            },
          },
        },
      });

      if (
        confirmedIntent.status === 'requires_action' &&
        confirmedIntent.next_action?.type === 'verify_with_microdeposits'
      ) {
        await this.verifyMicrodeposits(confirmedIntent.id, [32, 45]);
      }
      return confirmedIntent;
    } catch (error) {
      console.error('Error creating or confirming SetupIntent:', error);
      throw error;
    }
  }

  async verifyMicrodeposits(setupIntentId: string, amounts: number[]) {
    try {
      const verifiedIntent = await this.stripe.setupIntents.verifyMicrodeposits(setupIntentId, {
        amounts: amounts,
      });

      if (verifiedIntent.status === 'succeeded') {
        return {
          success: true,
          setupIntentId: verifiedIntent.id,
          mandateId: verifiedIntent.mandate,
        };
      } else {
        throw new Error(`Microdeposit verification failed. Status: ${verifiedIntent.status}`);
      }
    } catch (error) {
      console.error('Error verifying microdeposits:', error);
      throw error;
    }
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

  async markInvoiceAsPaid(invoiceId: string, options: Stripe.InvoicePayParams) {
    return this.stripe.invoices.pay(invoiceId, options);
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
  async createManualInvoice(
    customerId: string,
    productIds: string[],
    discount: number,
    tax: number
  ) {
    let coupon: Stripe.Coupon | null = null;
    let taxRate: Stripe.TaxRate | null = null;

    if (discount > 0) {
      coupon = await this.stripe.coupons.create({
        name: uuid(),
        amount_off: discount,
        currency: 'usd',
      });
    }

    if (tax > 0) {
      taxRate = await this.stripe.taxRates.create({
        display_name: uuid(),
        inclusive: false,
        percentage: tax,
      });
    }

    const invoiceParams: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: 'send_invoice',
      auto_advance: false,
    };

    if (coupon) {
      invoiceParams.discounts = [{ coupon: coupon.id }];
    }

    if (taxRate) {
      invoiceParams.default_tax_rates = [taxRate.id];
    }

    const invoice = await this.stripe.invoices.create(invoiceParams);

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

    const fInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id, {
      expand: ['payment_intent'],
    });

    return {
      id: fInvoice.id,
      total: fInvoice.amount_due,
      customer: fInvoice.customer_name,
      customer_email: fInvoice.customer_email,
      items: this.parseInvoiceLineItems(invoice.lines.data),
      client_secret: (fInvoice.payment_intent as Stripe.PaymentIntent).client_secret,
    };
  }

  async createInvoice(
    customerId: string,
    productIds: string[],
    // mandateId: string,
    paymentMethodId: string,
    discount: number,
    tax: number
  ) {
    let coupon: Stripe.Coupon | null = null;
    let taxRate: Stripe.TaxRate | null = null;

    if (discount > 0) {
      coupon = await this.stripe.coupons.create({
        name: uuid(),
        amount_off: discount,
        currency: 'usd',
      });
    }

    if (tax > 0) {
      taxRate = await this.stripe.taxRates.create({
        display_name: uuid(),
        inclusive: false,
        percentage: tax,
      });
    }

    const invoiceParams: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: 'charge_automatically',
      auto_advance: true,
      // payment_settings: {
      //   default_mandate: mandateId,
      // },
      default_payment_method: paymentMethodId,
    };

    if (coupon) {
      invoiceParams.discounts = [{ coupon: coupon.id }];
    }

    if (taxRate) {
      invoiceParams.default_tax_rates = [taxRate.id];
    }

    const invoice = await this.stripe.invoices.create(invoiceParams);

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
    };
  }

  async createInvoiceV2(customerId: string) {
    return await this.stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      auto_advance: false,
      days_until_due: 1,
    });
  }

  async createProduct(name: string) {
    return await this.stripe.products.create({
      name,
    });
  }

  async createInvoiceLineItem(
    customer: string,
    product: string,
    unitAmount: number,
    invoice: string,
    quantity = 1
  ) {
    return await this.stripe.invoiceItems.create({
      customer,
      price_data: {
        currency: 'usd',
        unit_amount: unitAmount,
        product,
      },
      quantity,
      invoice,
    });
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
      products.push({
        ...product,
        unit_amount: lineItem.price_data.unit_amount,
        type: lineItem.price_data.product_data.metadata.type,
      });
    }

    return products;
  }

  async updateProduct(id: string, updateProduct: UpdateInvoiceItemDto) {
    const updateData: Partial<Stripe.ProductUpdateParams> = {};
    if (updateProduct.name) updateData.name = updateProduct.name;
    if (updateProduct.description) updateData.description = updateProduct.description;
    if (updateProduct.price) {
      const price = await this.stripe.prices.create({
        currency: 'usd',
        unit_amount: updateProduct.price,
        product: id,
      });
      updateData.default_price = price.id;
    }
    if (Object.keys(updateData).length > 0) {
      return this.stripe.products.update(id, updateData);
    }
    return this.stripe.products.retrieve(id);
  }
}
