import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateRoomTypeDto {
  @ApiProperty({
    description: 'type of the Room type',
    example: 'Living Room',
    required: true,
    type: String,
  })
  type: string;

  @ApiProperty({
    description: 'Array of images associated with the Room type',
    example: [
      {
        ImageId: '66fbcb820aa5bb1fea70561b',
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

export const createRoomTypeSchema = Joi.object({
  type: Joi.string().trim().required(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});
