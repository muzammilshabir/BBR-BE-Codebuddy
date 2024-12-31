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

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  providers: [ReviewService, ReviewRepository, ReviewSeeder, ReviewsFixture],
  exports: [ReviewSeeder, ReviewsFixture],
  controllers: [ReviewController],
})
export class ReviewModule {}