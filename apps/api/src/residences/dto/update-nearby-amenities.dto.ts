import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateNearbyAmenitiesDto {
  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: true,
  })
  amenitiesList: Types.ObjectId[];

  @ApiProperty({
    example: [
      {
        amenitieId: '66ab4bd5161117eabe919e57',
        generalDescription: 'A large public park with playgrounds.',
        imageId: '66acda8b857c576159b74da4',
      },
    ],
    required: true,
  })
  highlightedAmenities: {
    amenitieId: Types.ObjectId;
    generalDescription: string;
    imageId?: Types.ObjectId;
  }[];
}

export const updateNearbyAmenitiesSchema = Joi.object({
  amenitiesList: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('amenitiesList')))
    .required(),
  highlightedAmenities: Joi.array()
    .items(
      Joi.object({
        amenitieId: Joi.string().custom(joiObjectIdValidator('amenitieId')).required(),
        generalDescription: Joi.string().required(),
        imageId: Joi.string().optional().custom(joiObjectIdValidator('imageId')),
      })
    )
    .required(),
});
