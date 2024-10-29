import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const verifyUserSchema = Joi.object({
  email: Joi.string().required(),
  token: Joi.string().required(),
});

export class VerifyUserDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'test@example.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'randomToken',
  })
  token: string;
}
