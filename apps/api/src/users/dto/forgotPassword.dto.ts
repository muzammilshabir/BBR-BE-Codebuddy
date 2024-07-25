import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email of the user', example: 'john@example.com' })
  email: string;
}
