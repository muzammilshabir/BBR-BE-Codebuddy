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

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ResidenceModule,
  ],
  controllers: [StripeController, PaymentController],
  providers: [StripeService, PaymentService, ServiceConfig, StripeWebhookService],
  exports: [StripeService, PaymentService, StripeWebhookService],
})
export class StripeModule {}
