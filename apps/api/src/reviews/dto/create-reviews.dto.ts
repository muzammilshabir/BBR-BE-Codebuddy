import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ReviewRating } from '../enum/review-enum';

export class Review {
  @ApiProperty({
    example: 'Amazing Place',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example:
      'Love the view and the property.',
    required: false,
  })
  details?: string;
}


export class CreateReviewDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a132a', required: true, type: String })
  residenceId: Types.ObjectId;

  @ApiProperty({ example: '5', required: true })
  rating: ReviewRating;

  @ApiProperty({ required: false })
  review?: Review;

  @ApiProperty({ example: [
    '66acda8b857c576159b74da2',
    '66acda8b857c576159b75da5'
  ], required: false })
  photos?: Types.ObjectId[];
}

export const createReviewDtoSchema = Joi.object({
  rating: Joi.string().required(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  review: Joi.object({
    title: Joi.string().optional(),
    details: Joi.string().optional(),
  }).optional(),
  photos: Joi.array()
  .items(Joi.string().custom(joiObjectIdValidator('photos')))
  .required(),
});
