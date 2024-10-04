import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateResidenceTypeDto {
  @ApiProperty({
    description: 'type of the ResidenceType',
    example: 'Condo',
    required: false,
    type: String,
  })
  type?: string;

  @ApiProperty({
    description: 'Array of images associated with the ResidenceType',
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

export const updateResidenceTypeSchema = Joi.object({
  type: Joi.string().trim().optional(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});
