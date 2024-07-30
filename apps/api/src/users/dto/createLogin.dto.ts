import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export class LoginDto {
  @ApiProperty({ description: 'Email of the user', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Password of the user', example: 'password123' })
  password: string;
}
