import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { GoogleReviews } from './googleReviewsSchema/googleReviews.schema';

@Injectable()
export class GoogleReviewRepository extends BaseRepository<GoogleReviews> {
  constructor(
    @InjectModel(GoogleReviews.name) private readonly googleReviewModel: Model<GoogleReviews>
  ) {
    super(googleReviewModel);
  }

  async findByPlaceId(placeId: string): Promise<GoogleReviews | null> {
    return this.googleReviewModel.findOne({ placeId, isDeleted: false }).populate([
      {
        path: 'residence',
        model: 'Residence',
        select: 'name',
      },
      { path: 'photos', model: 'Upload' },
      { path: 'developer', model: 'User', select: 'fullName' },
    ]);
  }
}
