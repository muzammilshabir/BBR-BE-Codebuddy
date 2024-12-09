import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateConversationDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: true })
  customerSupportId: string;

  @ApiProperty({ example: 'This is a reply message', required: true })
  message: string;

  @ApiProperty({
    description: 'Array of attachment objects',
    example: [{ fileId: '60d7fe6f9eb1f24a04d65633', type: 'image' }],
    required: false,
    type: Array,
  })
  attachments?: Array<{
    fileId: Types.ObjectId;
    type?: string;
  }>;
}

export const createConversationSchema = Joi.object({
  customerSupportId: Joi.string()
    .required()
    .custom(joiObjectIdValidator('customerSupportId')),
  message: Joi.string().required(),
  attachments: Joi.array()
    .items(
      Joi.object({
        fileId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        type: Joi.string().optional(),
      })
    )
    .optional(),
}); 