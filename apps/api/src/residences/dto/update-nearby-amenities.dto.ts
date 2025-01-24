import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateNearbyAmenitiesDto {
  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: false,
  })
  amenitiesList: Types.ObjectId[];

  @ApiProperty({
    example: [
      {
        amenityId: '66ab4bd5161117eabe919e57',
        generalDescription: 'A large public park with playgrounds.',
        ImageId: '66acda8b857c576159b74da4',
      },
    ],
    required: false,
  })
  highlightedAmenities: {
    amenityId: Types.ObjectId;
    generalDescription: string;
    ImageId?: Types.ObjectId;
  }[];
}

export const updateNearbyAmenitiesSchema = Joi.object({
  amenitiesList: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('amenitiesList')))
    .optional(),
  highlightedAmenities: Joi.array()
    .items(
      Joi.object({
        amenityId: Joi.string().custom(joiObjectIdValidator('amenityId')).optional(),
        generalDescription: Joi.string().optional(),
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
      })
    )
    .optional(),
});
