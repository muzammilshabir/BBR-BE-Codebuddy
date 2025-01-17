import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const createQuickReplySchema = Joi.object({
  message: Joi.string().trim().required().messages({
    'string.base': 'Message must be a string',
    'string.empty': 'Message cannot be empty',
    'any.required': 'Message is required',
  }),
  userId: Joi.string().trim().optional(),
});

export class CreateQuickReplyDto {
  @ApiProperty({
    description: 'The content of the quick reply message',
    example: 'Hello everyone',
    required: true,
    type: String,
  })
  message: string;
  
  userId?: string;
}
