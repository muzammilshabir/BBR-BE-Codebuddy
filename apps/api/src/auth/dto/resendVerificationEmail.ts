import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const resendVerificationEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export class ResendVerificationEmailDto {
  @ApiProperty({ type: String, description: 'email', example: 'john@me.com' })
  email: string;
}
