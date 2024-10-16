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

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
  ],
  controllers: [StripeController, PaymentController],
  providers: [
    StripeService,
    PaymentService,
    ServiceConfig,
    StripeWebhookService,
    TransactionRepository,
  ],
  exports: [StripeService, PaymentService, StripeWebhookService],
})
export class StripeModule {}
