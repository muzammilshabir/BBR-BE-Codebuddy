import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ServiceConfig } from 'src/config';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { UserModule } from 'src/users/user.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { ResidenceModule } from 'src/residences/residences.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schema/transaction.schema';
import { TransactionRepository } from './transaction.repository';
import { PaymentAdminController } from './payment-admin.controller';
import { Invoice, InvoiceSchema } from './schema/invoice.schema';
import { InvoiceItem, InvoiceItemSchema } from './schema/invoice-item.schema';
import { Subscription, SubscriptionSchema } from './schema/subscription.schema';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceItemRepository } from './invoice-item.repository';
import { SubscriptionRepository } from './subscription.repository';
import { ProcessPaymentService } from './process-payment.service';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { PaymentAttempt, PaymentAttemptSchema } from './schema/payment-attempt.schema';
import { PaymentMethod, PaymentMethodSchema } from './schema/payment-method.schema';
import { PaymentMethodRepository } from './payment-method.repository';
import { Refund, RefundSchema } from './schema/refund.schema';
import { RefundRepository } from './refund.repository';
import { SubscriptionPlanModule } from 'src/subscription-plan/subscription-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ResidenceModule,
    SubscriptionPlanModule,
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    MongooseModule.forFeature([{ name: InvoiceItem.name, schema: InvoiceItemSchema }]),
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: PaymentAttempt.name, schema: PaymentAttemptSchema }]),
    MongooseModule.forFeature([{ name: PaymentMethod.name, schema: PaymentMethodSchema }]),
    MongooseModule.forFeature([{ name: Refund.name, schema: RefundSchema }]),
  ],
  controllers: [
    StripeController,
    PaymentController,
    PaymentAdminController,
  ],
  providers: [
    StripeService,
    ProcessPaymentService,
    PaymentService,
    ServiceConfig,
    StripeWebhookService,
    TransactionRepository,
    InvoiceRepository,
    InvoiceItemRepository,
    SubscriptionRepository,
    PaymentAttemptRepository,
    PaymentMethodRepository,
    RefundRepository,
  ],
  exports: [
    StripeService,
    PaymentService,
    ProcessPaymentService,
    StripeWebhookService,
  ],
})
export class StripeModule {}
