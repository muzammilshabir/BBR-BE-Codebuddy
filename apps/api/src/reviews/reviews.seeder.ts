import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { ReviewRepository } from './reviews.repository';
import { Types } from 'mongoose';

@Injectable()
export class ReviewSeeder extends AbstractSeeder {
  public name = ReviewSeeder.name;
  private readonly logger = new Logger(ReviewSeeder.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
  ) {
    super();
  }

  async seed() {
    try {
      const reviews = [
        {
          rating: 2,
          residence: new Types.ObjectId('60d5f485f7c6a4b2b8e8b68b'),
          review: {
            title:
              'Not nice',
            details:
              'the property is not in a good location.',
          },
          photos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fd')],
          isRead: false,
          isResponded: false,
          isEdited: false,
          isResponseEdited: false,
          isHighlighted: false,
          isFlagged: false,
          isRemovalRequested: false,
          isDeleted: false,
          createdBy: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          rating: 3,
          residence: new Types.ObjectId('60d5f485f7c6a4b2b8e8b67b'),
          review: {
            title:
              'Average',
            details:
              'Good place but the view is lacking.',
          },
          photos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b3fd')],
          isRead: false,
          isResponded: false,
          isEdited: false,
          isResponseEdited: false,
          isHighlighted: false,
          isFlagged: false,
          isRemovalRequested: false,
          isDeleted: false,
          createdBy: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          rating: 5,
          residence: new Types.ObjectId('60d5f485f7c6a4b2b8e8b68b'),
          review: {
            title:
              'Amazing Place',
            details:
              'Lovely property and great view.',
          },
          photos: [new Types.ObjectId('60d5f485f7c6a4b2b8e845fd')],
          isRead: false,
          isResponded: false,
          isEdited: false,
          isResponseEdited: false,
          isHighlighted: false,
          isFlagged: false,
          isRemovalRequested: false,
          isDeleted: false,
          createdBy: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const review of reviews) {
        await this.reviewRepository.upsert({ rating: review.rating }, review);
      }
    } catch (error) {
      this.logger.error('Error seeding reviews', error);
    }
  }
}