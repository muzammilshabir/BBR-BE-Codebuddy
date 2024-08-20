import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schema/reviews.schema';
import { ReviewService } from './reviews.service';
import { ReviewController } from './reviews.controller';
import { ReviewRepository } from './reviews.repository';
import { ReviewSeeder } from './reviews.seeder';
import { ReviewsFixture } from './reviews.fixture';

@Module({
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])],
  providers: [ReviewService, ReviewRepository, ReviewSeeder,ReviewsFixture],
  exports: [ReviewSeeder,ReviewsFixture],
  controllers: [ReviewController],
})
export class ReviewModule {}