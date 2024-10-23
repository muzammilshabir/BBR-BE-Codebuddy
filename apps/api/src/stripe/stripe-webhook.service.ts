import { Injectable, RawBodyRequest } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { ResidenceService } from 'src/residences/residences.service';
import { TransactionRepository } from './transaction.repository';
import { PaymentMethodRepository } from './payment-method.repository';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { SubscriptionRepository } from './subscription.repository';
import { InvoiceItemRepository } from './invoice-item.repository';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceStatus } from './enum/invoice-status.enum';
import { PaymentAttemptStatus } from './enum/payment-attempt-status.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from './enum/transaction-status.enum';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ServiceConfig,
    private readonly stripeService: StripeService,
    private readonly residenceService: ResidenceService,
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository
  ) {
    this.stripe = new Stripe(configService.stripe.secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  async handleWebhooks(request: RawBodyRequest<Request>) {
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      throw new Error('No Stripe signature found in the request headers');
    }

    const event = this.stripe.webhooks.constructEvent(
      request.rawBody,
      signature,
      this.configService.stripe.webhookSecret
    );
    
    switch (event.type) {
      case 'setup_intent.succeeded':
        await this.handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_failed':
        return await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
      case 'invoice.paid':
        return await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
      default:
        console.error(`Unhandled event type ${event.type}.`);
    }
  }

  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    const verifySetupIntent = await this.stripe.setupIntents.verifyMicrodeposits(
      setupIntent.id,
      {
        amounts: [32, 45],
      }
    );
    const paymentMethod = {
      customerId: verifySetupIntent.customer,
      paymentMethodId: verifySetupIntent.payment_method,
      mandateId: verifySetupIntent.mandate,
    };
    await this.paymentMethodRepository.create(paymentMethod);
    console.log(`SetupIntent for ${setupIntent.customer} was successful!`);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
  }

  private async handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
    const paymentAttempt = await this.paymentAttemptRepository.find({
      stripeInvoiceId: stripeInvoice.id,
    });
    if (!paymentAttempt) {
      console.error(`No payment attempt found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }
    const internalInvoice = await this.invoiceRepository.findOne(paymentAttempt.invoiceId.toString());
    if (!internalInvoice) {
      console.error(`No internal invoice found for payment attempt ${paymentAttempt.id}`);
      return;
    }
    await this.paymentAttemptRepository.update(paymentAttempt.id, {
      status: PaymentAttemptStatus.SUCCEEDED,
    });
    await this.invoiceRepository.update(internalInvoice.id, {
      stripeInvoiceId: stripeInvoice.id,
      status: InvoiceStatus.PAID,
    });
    const transaction: CreateTransactionDto = {
      residenceId: internalInvoice.residenceId,
      developerId: internalInvoice.developerId,
      invoiceId: internalInvoice.id,
      amount: stripeInvoice.total,
      status: TransactionStatus.PAID,
    };
    await this.transactionRepository.create(transaction);
    return internalInvoice;
  }

  private async handleInvoiceFailed(stripeInvoice: Stripe.Invoice) {
    const paymentAttempt = await this.paymentAttemptRepository.find({
      stripeInvoiceId: stripeInvoice.id,
    });
    if (!paymentAttempt) {
      console.error(`No payment attempt found for Stripe invoice ${stripeInvoice.id}`);
      return;
    }
    const internalInvoice = await this.invoiceRepository.findOne(paymentAttempt.invoiceId.toString());
    if (!internalInvoice) {
      console.error(`No internal invoice found for payment attempt ${paymentAttempt.id}`);
      return;
    }
    await this.paymentAttemptRepository.update(paymentAttempt.id, {
      status: PaymentAttemptStatus.FAILED,
    });
    await this.invoiceRepository.update(internalInvoice.id, {
      stripeInvoiceId: stripeInvoice.id,
      status: InvoiceStatus.FAILED,
    });
    const transaction: CreateTransactionDto = {
      residenceId: internalInvoice.residenceId,
      developerId: internalInvoice.developerId,
      invoiceId: internalInvoice.id,
      amount: stripeInvoice.total,
      status: TransactionStatus.FAILED,
    };
    await this.transactionRepository.create(transaction);
    return internalInvoice;
  }
}
