import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { UploadFixture } from '../upload/upload.fixture';
import { Review } from './schema/reviews.schema';
import { ResidencesFixture } from '../residences/residences.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

@Injectable()
export class ReviewsFixture extends AbstractFixture {
  public dependsOn = [
    ResidencesFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture,
  ];

  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) {
    super();
  }
  name = ReviewsFixture.name;
  static REVIEW_1 = 'REVIEW_1';
  static REVIEW_2 = 'REVIEW_2';
  static REVIEW_3 = 'REVIEW_3';
  async load() {
    const residenceId = this.getReference(ResidencesFixture.RESIDENCE1)._id;
    const reviewPhotoId = this.getReference(UploadFixture.UPLOAD_1)._id;
    // Create a new Review document
    const review1 = await this.reviewModel.create({
      residenceId: residenceId,
      rating: 5,
      review: {
        title: 'Beautiful Place',
        details: 'Awesome seller and the place has amazing view.',
      },
      photos: [reviewPhotoId],
      createdById: '60d5f485f7c6a4b2b8e8b601',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const review2 = await this.reviewModel.create({
      residenceId: residenceId,
      rating: 2,
      review: {
        title: 'Not nice',
        details: 'the property is not in a good location.',
      },
      photos: [reviewPhotoId],
      createdById: '60d5f485f7c6a4b2b8e8b601',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const review3 = await this.reviewModel.create({
      residenceId: residenceId,
      rating: 3,
      review: {
        title: 'Average',
        details: 'Good place but the view is lacking.',
      },
      photos: [reviewPhotoId],
      createdById: '60d5f485f7c6a4b2b8e8b601',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.addReference(ReviewsFixture.REVIEW_1, review1);
    this.addReference(ReviewsFixture.REVIEW_2, review2);
    this.addReference(ReviewsFixture.REVIEW_3, review3);
  }
}
