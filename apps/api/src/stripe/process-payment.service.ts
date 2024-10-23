import { Injectable } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { ResidenceService } from 'src/residences/residences.service';
import { TransactionRepository } from './transaction.repository';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceItemRepository } from './invoice-item.repository';
import { SubscriptionRepository } from './subscription.repository';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { UserService } from 'src/users/user.service';


@Injectable()
export class ProcessPaymentService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ServiceConfig,
    private readonly stripeService: StripeService,
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly transactionRepository: TransactionRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
  ) {
  }

  async processPendingInvoices() {
    const invoices = await this.invoiceRepository.findAll({
      dueBy: { $lte: new Date() },
      status: 'pending',
    });
  
    for (const invoice of invoices.data) {
      const developer = await this.userService.findById(invoice.developerId.toString());
      const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoice._id.toString());
      // const invoiceSubscriptions = await this.subscriptionRepository.findByInvoiceId(invoice._id.toString());
      const paymentAttempts = await this.paymentAttemptRepository.findByInvoiceId(invoice._id.toString());
      if(paymentAttempts.length === 0) {
        const productIds = invoiceItems.map(item => item.stripeProductId.toString());
        await this.stripeService.createInvoice(
          developer.stripeCustomerId,
          productIds,
          invoice.paymentMethodId,
          invoice.discount,
          invoice.tax,
        );
      }
    }
  }

}
