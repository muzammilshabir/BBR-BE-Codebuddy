import { forwardRef, Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from 'src/stripe/schema/invoice.schema';
import { InvoiceItem, InvoiceItemSchema } from 'src/stripe/schema/invoice-item.schema';
import {
  InvoicePostPaymentAction,
  InvoicePostPaymentActionSchema,
} from 'src/stripe/schema/invoice-post-payment-action.schema';
import { InvoicePostPaymentActionService } from './invoice-post-payment-action.service';
import { Residence, ResidenceSchema } from 'src/residences/schema/residences.schema';
import {
  ResidenceDraft,
  ResidenceDraftSchema,
} from 'src/residencesDraft/schema/residencesDraft.schema';
import { City, CitySchema } from 'src/city/schema/city.schema';
import { Country, CountrySchema } from 'src/country/schema/country.schema';
import { User } from 'src/users/schema/user.schema';
import { UserSchema } from 'src/users/schema/user.schema';
import { RankingRequest } from 'src/rankingRequest/schema/rankingRequest.schema';
import { RankingRequestSchema } from 'src/rankingRequest/schema/rankingRequest.schema';
import {
  RankingRequestDraft,
  RankingRequestDraftSchema,
} from 'src/rankingRequestDraft/schema/rankingRequestDraft.schema';
import { Transaction, TransactionSchema } from 'src/stripe/schema/transaction.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/users/user.module';
import {
  FeatureRequest,
  FeatureRequestSchema,
} from 'src/featureRequests/schema/featureRequest.schema';
import {
  BbrVerification,
  BbrVerificationSchema,
} from 'src/bbr-verification/schema/bbr-verification.schema';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';
import {
  BespokeRequest,
  BespokeRequestSchema,
} from '../bespokeRequests/schema/bespokeRequests.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    MongooseModule.forFeature([{ name: InvoiceItem.name, schema: InvoiceItemSchema }]),
    CustomerSupportModule,
    MongooseModule.forFeature([
      {
        name: InvoicePostPaymentAction.name,
        schema: InvoicePostPaymentActionSchema,
      },
    ]),

    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
    MongooseModule.forFeature([{ name: FeatureRequest.name, schema: FeatureRequestSchema }]),
    MongooseModule.forFeature([{ name: BbrVerification.name, schema: BbrVerificationSchema }]),
    MongooseModule.forFeature([{ name: BespokeRequest.name, schema: BespokeRequestSchema }]),
    MongooseModule.forFeature([
      { name: RankingRequestDraft.name, schema: RankingRequestDraftSchema },
    ]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    forwardRef(() => StripeModule),
    forwardRef(() => AuthModule),
    UserModule,
  ],
  providers: [InvoiceService, InvoicePostPaymentActionService],
  exports: [InvoiceService, InvoicePostPaymentActionService],
})
export class InvoiceModule {}
