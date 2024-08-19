import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .trim()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
    .messages({
      'string.pattern.base': 'Invalid password',
    }),
});

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
    required: true,
  })
  email: string;

  @ApiProperty({
    example: 'Pa$$w0rd',
    description: 'The password of the user',
    required: true,
  })
  password: string;
}
