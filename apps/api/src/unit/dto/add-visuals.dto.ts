import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class AddVisualsDto {
  @ApiProperty({
    example: ['64b1b5f4e05c12a1f5d8e7c2'],
    required: true,
    description: 'Array of ObjectIds for main gallery photos',
  })
  mainGalleryPhotos: Types.ObjectId[];

  @ApiProperty({
    example: ['64b1b5f4e05c12a1f5d8e7c2'],
    required: false,
    description: 'Array of ObjectIds for second gallery photos',
  })
  secondGalleryPhotos?: Types.ObjectId[];

  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    required: false,
    description: 'ObjectId for video tour',
  })
  videoTour?: Types.ObjectId;

  @ApiProperty({
    example: 'https://example.com/video.mp4',
    required: false,
    description: 'Link to the video tour',
  })
  videoTourLink?: string;
}

export const addVisualsSchema = Joi.object({
  mainGalleryPhotos: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('mainGalleryPhotos')).required())
    .required()
    .description('Array of ObjectIds for main gallery photos'),
  secondGalleryPhotos: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('secondGalleryPhotos')))
    .optional()
    .description('Array of ObjectIds for second gallery photos'),
  videoTour: Joi.string()
    .custom(joiObjectIdValidator('videoTour'))
    .optional()
    .description('ObjectId for video tour'),
  videoTourLink: Joi.string().uri().optional().description('Link to the video tour'),
});
