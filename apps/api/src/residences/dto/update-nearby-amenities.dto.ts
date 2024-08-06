import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { isValidObjectId } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateNearbyAmenitiesDto {
  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: true,
  })
  amenitiesList: Types.ObjectId[];

  @ApiProperty({
    example: [
      {
        name: 'Park',
        generalDescription: 'A large public park with playgrounds.',
        imageId: '66acda8b857c576159b74da4',
      },
    ],
    required: true,
  })
  highlightedAmenities: {
    name: string;
    generalDescription: string;
    imageId?: Types.ObjectId;
  }[];
}

export const updateNearbyAmenitiesSchema = Joi.object({
  amenitiesList: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!isValidObjectId(value)) {
          return helpers.message({ custom: 'Invalid ObjectId for amenitiesList' });
        }
        return value;
      })
    )
    .required(),
  highlightedAmenities: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        generalDescription: Joi.string().required(),
        imageId: Joi.string()
          .optional()
          .custom((value, helpers) => {
            if (value && !isValidObjectId(value)) {
              return helpers.message({ custom: 'Invalid ObjectId for imageId' });
            }
            return value;
          }),
      })
    )
    .required(),
});
