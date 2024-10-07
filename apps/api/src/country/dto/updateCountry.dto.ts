import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateCountryDto {
  @ApiProperty({
    description: 'Name of the country',
    example: 'Medellin',
    required: false,
    type: String,
  })
  name?: string;

  @ApiProperty({
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  geographicalAreasId?: Types.ObjectId;

  @ApiProperty({
    description: 'Array of images associated with the country',
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

export const updateCountrySchema = Joi.object({
  name: Joi.string().trim().optional(),
  geographicalAreasId: Joi.string().optional().custom(joiObjectIdValidator('geographicalAreasId')),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});
