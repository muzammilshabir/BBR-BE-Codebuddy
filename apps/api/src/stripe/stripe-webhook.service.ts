import {
  Injectable,
  RawBodyRequest,
  Logger,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { Request, Response } from 'express';
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
import { InvoicePostPaymentActionService } from 'src/invoice/invoice-post-payment-action.service';
import { InjectModel } from '@nestjs/mongoose';
import { RefundRequest } from './schema/refund-request.schema';
import { Model } from 'mongoose';
import { RefundStatus } from './enum/refund-status.enum';
import { PaymentMethodType } from 'src/invoice-schedule/invoiceSchedule.enum';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly configService: ServiceConfig,
    private readonly stripeService: StripeService,
    private readonly residenceService: ResidenceService,
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly invoicePostPaymentActionService: InvoicePostPaymentActionService,

    @InjectModel(RefundRequest.name)
    private readonly refundRequestModel: Model<RefundRequest>
  ) {
    this.stripe = new Stripe(configService.stripe.secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  async handleWebhooks(request: RawBodyRequest<Request>, response: Response) {
    try {
      const signature = request.headers['stripe-signature'];

      if (!signature) {
        throw new HttpException(
          'No Stripe signature found in the request headers',
          HttpStatus.BAD_REQUEST
        );
      }

      let event: Stripe.Event;
      try {
        event = this.stripe.webhooks.constructEvent(
          request.rawBody,
          signature,
          this.configService.stripe.webhookSecret
        );
      } catch (err) {
        this.logger.error(`Webhook signature verification failed: ${err.message}`);
        throw new HttpException('Webhook signature verification failed', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Received Stripe webhook event: ${event.type}`);

      let result;
      switch (event.type) {
        case 'setup_intent.succeeded':
          result = await this.handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
          break;
        case 'payment_intent.succeeded':
          result = await this.handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent
          );
          break;
        case 'invoice.payment_failed':
          result = await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.paid':
          result = await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'charge.refunded':
          result = await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;
        default:
          this.logger.warn(`Unhandled event type ${event.type}`);
          return response
            .status(HttpStatus.OK)
            .json({ received: true, message: `Unhandled event type ${event.type}` });
      }

      return response.status(HttpStatus.OK).json({ received: true, result });
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      return response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        received: false,
        error: error.message,
      });
    }
  }

  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    this.logger.log(`Processing setup_intent.succeeded for SetupIntent ${setupIntent.id}`);
    try {
      let intent = setupIntent;
      if (setupIntent.status == 'requires_action') {
        intent = await this.stripe.setupIntents.verifyMicrodeposits(setupIntent.id, {
          amounts: [32, 45],
        });
      }
      const paymentMethod = {
        customerId: intent.customer,
        paymentMethodId: intent.payment_method,
        mandateId: intent.mandate,
      };
      await this.paymentMethodRepository.create(paymentMethod);
      this.logger.log(`SetupIntent for ${setupIntent.customer} was successful!`);
      return { success: true, customerId: setupIntent.customer };
    } catch (error) {
      this.logger.error(
        `Error processing SetupIntent ${setupIntent.id}: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        `Error processing SetupIntent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Processing payment_intent.succeeded for PaymentIntent ${paymentIntent.id}`);
    return { success: true, amount: paymentIntent.amount };
  }

  private async handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
    this.logger.log(`Processing invoice.paid for Stripe invoice ${stripeInvoice.id}`);
    try {
      const paymentAttempt = await this.paymentAttemptRepository.find({
        stripeInvoiceId: stripeInvoice.id,
      });
      if (!paymentAttempt) {
        throw new BadRequestException(
          `No payment attempt found for Stripe invoice ${stripeInvoice.id}`
        );
      }
      const internalInvoice = await this.invoiceRepository.findOne(
        paymentAttempt.invoiceId.toString()
      );
      if (!internalInvoice) {
        throw new BadRequestException(
          `No internal invoice found for payment attempt ${paymentAttempt.id}`
        );
      }

      await this.paymentAttemptRepository.update(paymentAttempt.id, {
        status: PaymentAttemptStatus.SUCCEEDED,
      });
      await this.invoiceRepository.update(internalInvoice.id, {
        stripeInvoiceId: stripeInvoice.id,
        stripeChargeId:
          typeof stripeInvoice.charge === 'string' ? stripeInvoice.charge : stripeInvoice.charge.id,
        status: InvoiceStatus.PAID,
        pdfLink: stripeInvoice.invoice_pdf,
        paymentMethodType: PaymentMethodType.CARD,
      });
      if (internalInvoice.residenceId) {
        const transaction: CreateTransactionDto = {
          residenceId: internalInvoice.residenceId,
          developerId: internalInvoice.developerId,
          invoiceId: internalInvoice.id,
          amount: stripeInvoice.total,
          status: TransactionStatus.PAID,
        };
        await this.transactionRepository.create(transaction);
      }

      await this.invoicePostPaymentActionService.performActions(
        internalInvoice.id,
        stripeInvoice.total
      );

      this.logger.log(`Successfully processed paid invoice ${internalInvoice.id}`);
      return { success: true, invoiceId: internalInvoice.id, amount: stripeInvoice.total };
    } catch (error) {
      this.logger.error(
        `Error processing paid invoice ${stripeInvoice.id}: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        `Error processing paid invoice: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async handleChargeRefunded(stripeCharge: Stripe.Charge) {
    this.logger.log(`Processing charge.refunded for Stripe charge ${stripeCharge.id}`);
    const refundRequest = await this.refundRequestModel.findOne({
      stripeRefundId: stripeCharge.refunds.data[0].id,
    });
    if (!refundRequest) {
      throw new BadRequestException(
        `No refund request found for Stripe charge ${stripeCharge.refunds.data[0].id}`
      );
    }
    await this.refundRequestModel.updateOne(
      { _id: refundRequest.id },
      { refundStatus: RefundStatus.REFUNDED }
    );

    return { success: true, chargeId: stripeCharge.id };
  }

  private async handleInvoiceFailed(stripeInvoice: Stripe.Invoice) {
    this.logger.log(`Processing invoice.payment_failed for Stripe invoice ${stripeInvoice.id}`);
    try {
      const paymentAttempt = await this.paymentAttemptRepository.find({
        stripeInvoiceId: stripeInvoice.id,
      });
      if (!paymentAttempt) {
        throw new Error(`No payment attempt found for Stripe invoice ${stripeInvoice.id}`);
      }
      const internalInvoice = await this.invoiceRepository.findOne(
        paymentAttempt.invoiceId.toString()
      );
      if (!internalInvoice) {
        throw new Error(`No internal invoice found for payment attempt ${paymentAttempt.id}`);
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
      this.logger.log(`Successfully processed failed invoice ${internalInvoice.id}`);
      return { success: false, invoiceId: internalInvoice.id, amount: stripeInvoice.total };
    } catch (error) {
      this.logger.error(
        `Error processing failed invoice ${stripeInvoice.id}: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        `Error processing failed invoice: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
