import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentDto, PaymentItem } from './dto/create-payment.dto';
import { CreateSubscriptionDto, SubscriptionItem } from './dto/create-subscription.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { SubscriptionLineItemDto } from './dto/subscription-line-item.dto';
import { UserService } from 'src/users/user.service';
import { ResidenceService } from 'src/residences/residences.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { ChangeSubscriptionPaymentDto } from './dto/change-subscription-payment-method.dto';
import { UpdateSubscriptionDto, UpdateSubscriptionItem } from './dto/update-subscription.dto';
import { Residence } from 'src/residences/schema/residences.schema';

@Injectable()
export class PaymentService {
  constructor(
     private readonly stripeService: StripeService,
     private readonly userService: UserService,
     private readonly residenceService: ResidenceService,
  ) {
  }

  private convertPaymentItemsToLineItems(residenceId: string, items: PaymentItem[]): PaymentLineItemDto[] {
    const lineItems: PaymentLineItemDto[] = [];

    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              id: residenceId,
              type: item.type,
            },
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      });
    }

    return lineItems;
  }

  private convertSubscriptionItemsToLineItems(items: SubscriptionItem[]): SubscriptionLineItemDto[] {
    const lineItems: SubscriptionLineItemDto[] = [];

    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              id: item.residenceId.toString(),
              type: item.type,
            },
          },
          recurring: {
            interval: item.interval,
            interval_count: item.intervalCount,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      });
    }

    return lineItems;
  }

  private convertUpdateSubscriptionItems(items: UpdateSubscriptionItem[]): {itemId: string, item: SubscriptionLineItemDto}[] {
    const lineItems: {itemId: string, item: SubscriptionLineItemDto}[] = [];

    for (const item of items) {
      lineItems.push({
        itemId: item.id,
        item: {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              id: item.residenceId.toString(),
              type: item.type,
            },
          },
          recurring: {
            interval: item.interval,
            interval_count: item.intervalCount,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      }});
    }

    return lineItems;
  }

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertSubscriptionItemsToLineItems(createSubscriptionDto.subscriptionItems);
    return this.stripeService.createSubscriptionInvoice(customerId, lineItems);
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertPaymentItemsToLineItems(createPaymentDto.residenceId.toString(), createPaymentDto.paymentItems);
    return this.stripeService.createPaymentInvoice(customerId, createPaymentDto.residenceId.toString(), lineItems);
  }

  async createSubscriptionSession(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertSubscriptionItemsToLineItems(createSubscriptionDto.subscriptionItems);
    return this.stripeService.createSubscriptionSession(customerId, lineItems);
  }

  async createPaymentSession(userId: string, createPaymentDto: CreatePaymentDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertPaymentItemsToLineItems(createPaymentDto.residenceId.toString(), createPaymentDto.paymentItems);
    return this.stripeService.createPaymentSession(customerId, lineItems);
  }

  async createCustomerPortalSession(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.createCustomerPortalSession(customerId);
  }

  async listCustomers() {
    return this.stripeService.listCustomers();
  }

  async getUserPaymentMethods(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerPaymentMethods(customerId);
  }

  async changeSubscriptionPaymentMethod(userId: string, changeSubscriptionPaymentDto: ChangeSubscriptionPaymentDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.changeSubscriptionPaymentMethod(customerId, changeSubscriptionPaymentDto.subscriptionId, changeSubscriptionPaymentDto.paymentMethodId);
  }

  async createSetupIntent(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return (await this.stripeService.createSetupIntent(customerId)).client_secret;    
  }

  async deletePaymentMethod(userId: string, methodId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.deletePaymentMethod(customerId, methodId);
  }

  async updateSubscription(userId: string, residenceId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const residence: Residence = await this.residenceService.getResidenceById(residenceId);
    if(residence.developerId.toString() != userId) {
      throw new Error('Residence not found');
    }
    const lineItems = this.convertUpdateSubscriptionItems(updateSubscriptionDto.subscriptionItems);
    return this.stripeService.updateSubscription(residence.subscriptionId, lineItems);
  }

  async getUserPayments(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerPayments(customerId);
  }

  async getUserSubscriptions(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerSubscriptions(customerId);
  }

  async getUserInvoices(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerInvoices(customerId);
  }

  async getUserInvoice(userId: string, invoiceId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerInvoice(customerId, invoiceId);
  }

  async getUserInvoiceAdmin(invoiceId: string) {
    return this.stripeService.getCustomerInvoiceAdmin(invoiceId);
  }

  async refundUserInvoice(invoiceId: string, refundPaymentDto: RefundPaymentDto) {
    return this.stripeService.refundInvoice(invoiceId, refundPaymentDto);
  }
}
