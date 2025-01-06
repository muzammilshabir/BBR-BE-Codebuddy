import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Review, ReviewSchema } from './schema/reviews.schema';
import { ReviewService } from './reviews.service';
import { ReviewController } from './reviews.controller';
import { ReviewRepository } from './reviews.repository';
import { ReviewSeeder } from './reviews.seeder';
import { ReviewsFixture } from './reviews.fixture';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { UserModule } from 'src/users/user.module';
import { ResidenceModule } from 'src/residences/residences.module';
import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from 'src/residence-activity-log/schema/residence-activity-log.schema';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
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
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DevResidenceActivityLog.name, schema: DevResidenceActivityLogSchema },
    ]),
  ],
  providers: [
    ReviewService,
    ReviewRepository,
    ReviewSeeder,
    ReviewsFixture,
    ResidenceActivityLogRepository,
    DevResidenceActivityLogRepository,
  ],
  exports: [ReviewSeeder, ReviewsFixture],
  controllers: [ReviewController],
})
export class ReviewModule {}
