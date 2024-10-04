import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateCityDto {
  @ApiProperty({
    description: 'Name of the city',
    example: 'Medellin',
    required: false,
    type: String,
  })
  name?: string;

  @ApiProperty({
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  countryId?: Types.ObjectId;

  @ApiProperty({
    description: 'Array of images associated with the city',
    example: [
      {
        ImageId: '603d2f7f5d9a3c45f4f4b1e1',
        type: 'main',
      },
    ],
    required: false,
  })
  upload?: {
    ImageId?: Types.ObjectId;
    type?: string;
  }[];
}

export const updateCitySchema = Joi.object({
  name: Joi.string().trim().optional(),
  countryId: Joi.string().optional().custom(joiObjectIdValidator('countryId')),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});
