import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { CometChatReceiverType } from 'src/users/types/comet-chat.type';

export class ToggleConversationDto {
  @ApiProperty({
    description: 'The type of conversation',
    enum: CometChatReceiverType,
    example: CometChatReceiverType.USER,
    required: true,
  })
  type: CometChatReceiverType;

  @ApiProperty({
    description: 'The ID of the conversation',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the user on behalf of whom the action is performed',
    required: true,
    type: String,
  })
  onBehalfOfUserId: string;
}

export const toggleConversationDtoSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(CometChatReceiverType))
    .required(),
  id: Joi.string().required(),
  onBehalfOfUserId: Joi.string().required(),
});
