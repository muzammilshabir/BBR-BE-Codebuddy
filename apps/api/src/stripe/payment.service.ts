import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentDto, PaymentItem } from './dto/create-payment.dto';
import { CreateSubscriptionDto, SubscriptionItem } from './dto/create-subscription.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { SubscriptionLineItemDto } from './dto/subscription-line-item.dto';
import { UserService } from 'src/users/user.service';

@Injectable()
export class PaymentService {
  constructor(
     private readonly stripeService: StripeService,
     private readonly userService: UserService,
  ) {
  }

  private convertPaymentItemsToLineItems(items: PaymentItem[]): PaymentLineItemDto[] {
    const lineItems: PaymentLineItemDto[] = [];

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

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertSubscriptionItemsToLineItems(createSubscriptionDto.subscriptionItems);
    return this.stripeService.createSubscriptionInvoice(customerId, lineItems);
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertPaymentItemsToLineItems(createPaymentDto.paymentItems);
    return this.stripeService.createPaymentInvoice(customerId, lineItems);
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
    const lineItems = this.convertPaymentItemsToLineItems(createPaymentDto.paymentItems);
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

}
