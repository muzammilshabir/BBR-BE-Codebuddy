import { Module } from '@nestjs/common';
import { RankingCategoryModule } from 'src/rankingCategory/rankingCategory.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';
import { Plan, PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { ApplyAdditionalServiceRequestController } from './apply-additional.controller';
import { ApplyAdditionalServiceRequestService } from './additional-service.service';
import { BbrVerification, BbrVerificationSchema } from 'src/bbr-verification/schema/bbr-verification.schema';
import { FeatureRequestSchema } from 'src/featureRequests/schema/featureRequest.schema';
import { FeatureRequest } from 'src/featureRequests/schema/featureRequest.schema';
import { InvoicePostPaymentAction } from 'src/stripe/schema/invoice-post-payment-action.schema';
import { InvoicePostPaymentActionSchema } from 'src/stripe/schema/invoice-post-payment-action.schema';
import { BbrVerificationRepository } from 'src/bbr-verification/bbr-verification.repository';
import { FeatureRequestRepository } from 'src/featureRequests/featureRequests.repository';

@Module({
  imports: [
    RankingCategoryModule,
    InvoiceModule,
    StripeModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: BbrVerification.name, schema: BbrVerificationSchema }]),
    MongooseModule.forFeature([{ name: FeatureRequest.name, schema: FeatureRequestSchema }]),
    MongooseModule.forFeature([{ name: InvoicePostPaymentAction.name, schema: InvoicePostPaymentActionSchema }]),
  ],
  controllers: [ApplyAdditionalServiceRequestController],
  providers: [
    ApplyAdditionalServiceRequestService,
    FeatureRequestRepository,
    BbrVerificationRepository,
  ],
})
export class AdditionalServiceModule {}
