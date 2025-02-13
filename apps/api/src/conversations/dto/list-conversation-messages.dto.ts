import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export enum ListConversationMessagesDirection {
  BEFORE = 'before',
  AFTER = 'after',
}

export class ListConversationMessagesDto {
  @ApiProperty({
    description: 'The ID of the conversation',
    required: true,
    type: String,
  })
  conversationId: string;

  @ApiProperty({
    description: 'The types of messages to fetch',
    required: false,
    type: String,
    example: 'text,image,audio,video,file',
  })
  types: string;

  @ApiProperty({
    description: 'The cursor to fetch the next page of messages',
    required: false,
    type: String,
  })
  cursor: string;

  @ApiProperty({
    description: 'The direction to fetch the messages',
    enum: ListConversationMessagesDirection,
    example: ListConversationMessagesDirection.BEFORE,
    required: false,
  })
  direction: ListConversationMessagesDirection;

  @ApiProperty({
    description: 'The limit of messages to fetch',
    required: true,
    type: Number,
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'The category of the messages to fetch',
    required: false,
    type: String,
    example: 'text,image,audio,video,file',
  })
  category: string;
}

export const listConversationMessagesDtoSchema = Joi.object({
  conversationId: Joi.string().required(),
  types: Joi.string(),
  cursor: Joi.string(),
  direction: Joi.string().valid(...Object.values(ListConversationMessagesDirection)),
  limit: Joi.number().required(),
  category: Joi.string(),
});
