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

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Pass@123',
    description: 'The current password of the user',
  })
  currentPassword: string;

  @ApiProperty({
    example: 'Pass@456',
    description: 'The new password that the user wants to set',
  })
  newPassword: string;

  @ApiProperty({
    example: 'Pass@456',
    description: 'Confirmation of the new password',
  })
  confirmPassword: string;
}

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'New password and confirm password must match',
    'string.empty': 'Confirm password is required',
  }),
});
