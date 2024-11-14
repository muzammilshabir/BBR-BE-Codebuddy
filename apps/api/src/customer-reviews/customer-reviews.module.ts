import { Module } from '@nestjs/common';
import { CustomerReviewsController } from './customer-reviews.controller';
import { CustomerReviewsService } from './customer-reviews.service';
import { ConfigModule } from '@nestjs/config';
import { MailerCoreModule } from '../mailer/mailer.module';
import { UserModule } from '../users/user.module';
import { ResidenceModule } from '../residences/residences.module';

@Module({
  imports: [ConfigModule.forRoot(), MailerCoreModule, UserModule, ResidenceModule],
  controllers: [CustomerReviewsController],
  providers: [CustomerReviewsService],
})
export class CustomerReviewsModule {}
