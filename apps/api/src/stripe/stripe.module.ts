import { forwardRef, Module } from '@nestjs/common';
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
import { PaymentAttemptSeeder } from './payment-attempt.seeder';
import { RefundSeeder } from './refund.seeder';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { AllInOnePaymentSeeder } from './all-in-one-payment.seeder';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Feature, FeatureSchema } from 'src/subscription-plan/schema/feature.schema';
import { Plan, PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { Residence, ResidenceSchema } from 'src/residences/schema/residences.schema';
import { UploadModule } from 'src/upload/upload.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from 'src/residence-activity-log/schema/residence-activity-log.schema';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';
import { DevResidenceActivityLogRepository } from 'src/dev-residence-activity-log/dev-residence-activity-log.repository';
import {
  DevResidenceActivityLog,
  DevResidenceActivityLogSchema,
} from 'src/dev-residence-activity-log/schema/dev-residence-activity-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    SubscriptionPlanModule,
    UploadModule,
    PdfModule,
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    MongooseModule.forFeature([{ name: InvoiceItem.name, schema: InvoiceItemSchema }]),
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: PaymentAttempt.name, schema: PaymentAttemptSchema }]),
    MongooseModule.forFeature([{ name: PaymentMethod.name, schema: PaymentMethodSchema }]),
    MongooseModule.forFeature([{ name: Refund.name, schema: RefundSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Feature.name, schema: FeatureSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DevResidenceActivityLog.name, schema: DevResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    forwardRef(() => InvoiceModule),
  ],
  controllers: [StripeController, PaymentController, PaymentAdminController],
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
    PaymentAttemptSeeder,
    RefundSeeder,
    AllInOnePaymentSeeder,
    ResidenceActivityLogRepository,
    DevResidenceActivityLogRepository,
    DeveloperProfileActivityLogRepository,
  ],
  exports: [
    StripeService,
    PaymentService,
    ProcessPaymentService,
    StripeWebhookService,
    PaymentAttemptSeeder,
    RefundSeeder,
    AllInOnePaymentSeeder,
    InvoiceItemRepository,
    PaymentAttemptRepository,
  ],
})
export class StripeModule {}
