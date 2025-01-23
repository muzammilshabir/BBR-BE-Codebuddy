import { ApiProperty } from '@nestjs/swagger';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import * as joi from 'joi';
import JoiDate from '@joi/date';

const Joi = joi.extend(JoiDate);

export class SendMessageDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: true })
  senderId: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: true })
  receiverId: string;

  @ApiProperty({ example: 'user', enum: ['user', 'group'], required: true })
  receiverType: string;

  @ApiProperty({ example: 'Hello, this is a scheduled message', required: true })
  messageText: string;
}

export const sendMessageDtoSchema = Joi.object({
  senderId: Joi.string().required().custom(joiObjectIdValidator('senderId')),
  receiverId: Joi.string().required().custom(joiObjectIdValidator('receiverId')),
  receiverType: Joi.string().valid('user', 'group').required(),
  messageText: Joi.string().required(),
});
