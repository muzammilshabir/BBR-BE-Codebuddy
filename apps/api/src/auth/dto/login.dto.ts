import { passwordSchema } from '@bbr/api-core/modules/dto/common.dto';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { UserRole } from '../../users/enum/user.enum';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: passwordSchema,
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

export const thirdPartyLoginSchema = Joi.object({
  token: Joi.string().required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
});

export class ThirdPartyLoginDto {
  @ApiProperty({
    example: '123456', // id_token

    required: true,
  })
  token: string;

  @ApiProperty({
    example: UserRole.BUYER,
    enum: UserRole,
    required: true,
  })
  role: UserRole;
}
