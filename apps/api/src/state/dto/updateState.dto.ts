import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateStateDto {
  @ApiProperty({
    description: 'Name of the state',
    example: 'California',
    required: false,
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'State code',
    example: 'CA',
    required: false,
    type: String,
  })
  stateCode?: string;

  @ApiProperty({
    description: 'Country code',
    example: 'US',
    required: false,
    type: String,
  })
  countryCode?: string;

  @ApiProperty({
    description: 'Latitude of the state',
    example: 36.7783,
    required: false,
    type: Number,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude of the state',
    example: -119.4179,
    required: false,
    type: Number,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Active status of the state',
    example: true,
    required: false,
    type: Boolean,
  })
  active?: boolean;

  @ApiProperty({
    description: 'ID of the country this state belongs to',
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  countryId?: Types.ObjectId;

  @ApiProperty({
    description: 'Array of images associated with the state',
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

export const updateStateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  stateCode: Joi.string().trim().optional(),
  countryCode: Joi.string().trim().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  active: Joi.boolean().optional(),
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
