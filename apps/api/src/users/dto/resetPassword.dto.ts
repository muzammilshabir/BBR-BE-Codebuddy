import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const resetPasswordSchema = Joi.object({
  id: Joi.string().required(),
  token: Joi.string().required(),
  password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});

export class ResetPasswordDto {
  @ApiProperty({
    description: 'id',
    example: 'abcdef123456',
    required: true,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Reset token from the forgot password email',
    example: 'abcdef123456',
    required: true,
    type: String,
  })
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'newpassword123',
    required: true,
    type: String,
  })
  password: string;
}
