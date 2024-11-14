import { Module } from '@nestjs/common';
import { CustomerReviewsController } from './customer-reviews.controller';
import { CustomerReviewsService } from './customer-reviews.service';

@Module({
  controllers: [CustomerReviewsController],
  providers: [CustomerReviewsService]
})
export class CustomerReviewsModule {}
