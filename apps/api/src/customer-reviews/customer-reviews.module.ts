import { Module } from '@nestjs/common';
import { CustomerReviewsController } from './customer-reviews.controller';
import { CustomerReviewsService } from './customer-reviews.service';
import { ConfigModule } from '@nestjs/config';
import { MailerCoreModule } from '../mailer/mailer.module';
import { UserModule } from '../users/user.module';
import { ResidenceModule } from '../residences/residences.module';
import { CustomerReviewRepository } from './customer-reviews.repository';
import { CustomerReview, CustomerReviewSchema } from './schema/customerReviews.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleReviewRepository } from './google-reviews.repository';
import { GoogleReviews, GoogleReviewsSchema } from './googleReviewsSchema/googleReviews.schema';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ResidenceActivityLog, ResidenceActivityLogSchema } from 'src/residence-activity-log/schema/residence-activity-log.schema';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([
      { name: CustomerReview.name, schema: CustomerReviewSchema },
      { name: GoogleReviews.name, schema: GoogleReviewsSchema },
    ]),
    MongooseModule.forFeature([{ name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema }]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CustomerReviewsController],
  providers: [CustomerReviewsService, CustomerReviewRepository, GoogleReviewRepository, ResidenceActivityLogRepository],
})
export class CustomerReviewsModule {}
