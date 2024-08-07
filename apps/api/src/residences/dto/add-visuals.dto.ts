import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class AddVisualsDto {
  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: true,
  })
  mainGalleryPhotos: Types.ObjectId[];

  @ApiProperty({
    example: ['66acda8b857c576159b74da4'],
    required: false,
  })
  secondGalleryPhotos?: Types.ObjectId[];

  @ApiProperty({
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  videoTour?: Types.ObjectId;

  @ApiProperty({
    example: 'https://www.youtube.com/dummyLink',
    required: false,
  })
  videoTourLink?: string;
}

export const addVisualsSchema = Joi.object({
  mainGalleryPhotos: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('mainGalleryPhotos')))
    .required(),
  secondGalleryPhotos: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('secondGalleryPhotos')))
    .optional(),
  videoTour: Joi.string().optional().custom(joiObjectIdValidator('videoTour')),
  videoTourLink: Joi.string().uri().optional(),
});
