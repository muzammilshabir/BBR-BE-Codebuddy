import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'test@example.com', required: true, type: String })
  email: string;
}

export const subscribeNewsletterDtoSchema = Joi.object({
  email: Joi.string().required(),
});
