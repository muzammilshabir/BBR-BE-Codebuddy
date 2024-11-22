import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ReviewRating } from '../enum/customer-review.enum';

export class CreateReviewDto {
  @ApiProperty({
    example: 'John Doe',
    required: true,
  })
  fullName: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    example: '9876543210',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    example: '60d9c6a0a11c3c6c6a9a132a',
    required: true,
    type: String,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    example: 9.2,
    required: true,
    description: 'Overall rating out of 10',
  })
  overallRating: number;

  @ApiProperty({
    required: true,
    type: Object,
    description: 'Ratings for different aspects of the residence',
    example: {
      location: ReviewRating.FIVE_STAR,
      amenities: ReviewRating.FOUR_STAR,
      serviceQuality: ReviewRating.THREE_STAR,
      designArchitecture: ReviewRating.FOUR_STAR,
      livingExperience: ReviewRating.FIVE_STAR,
      value: ReviewRating.FOUR_STAR,
    },
  })
  ratings: {
    location: ReviewRating;
    amenities: ReviewRating;
    serviceQuality: ReviewRating;
    designArchitecture: ReviewRating;
    livingExperience: ReviewRating;
    value: ReviewRating;
  };

  @ApiProperty({
    example: 'Great experience, would recommend!',
    required: true,
  })
  review: string;

  @ApiProperty({
    example: ['66acda8b857c576159b74da2', '66acda8b857c576159b75da5'],
    required: false,
  })
  photos?: Types.ObjectId[];

  @ApiProperty({
    required: true,
    type: Boolean,
    default: false,
    description: 'Indicates whether the review is from a verified buyer',
    example: false,
  })
  isVerifiedBuyer: boolean;

  @ApiProperty({
    example: '2024-11-14T12:34:56Z',
    description: 'Date when the purchase was made',
    required: false,
  })
  dateOfPurchase?: Date;
}

export const createReviewDtoSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  overallRating: Joi.number().min(1).max(10).required(),
  ratings: Joi.object({
    location: Joi.number().min(1).max(5).required(),
    amenities: Joi.number().min(1).max(5).required(),
    serviceQuality: Joi.number().min(1).max(5).required(),
    designArchitecture: Joi.number().min(1).max(5).required(),
    livingExperience: Joi.number().min(1).max(5).required(),
    value: Joi.number().min(1).max(5).required(),
  }).required(),
  review: Joi.string().required(),
  photos: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('photos')))
    .optional(),
  isVerifiedBuyer: Joi.boolean().required().default(false),
  dateOfPurchase: Joi.date().optional(),
});
