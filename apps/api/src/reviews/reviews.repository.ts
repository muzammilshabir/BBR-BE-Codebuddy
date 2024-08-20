import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './schema/reviews.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ReviewRepository extends BaseRepository<Review> {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) {
    super(reviewModel);
  }

  async findById(reviewId: string): Promise<Review> {
    return this.reviewModel.findById(reviewId).populate([
      { path: 'residence', model: 'Residence' },
      { path: 'photos', model: 'Upload' },
      { path: 'createdById', model: 'User' },
    ]);
  }
}