import { passwordSchema } from '@bbr/api-core/modules/dto/common.dto';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email to send password reset link',
    example: 'john@doe.com',
  })
  email: string;
}

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  token: Joi.string().trim().required(),
  password: passwordSchema,
});

export class ResetPasswordDto {
  @ApiProperty({
    example: '',
  })
  token: string;

  @ApiProperty({
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    example: 'Pass@123',
    description: 'New Password',
  })
  password: string;
}
