import { passwordSchema } from '@bbr/api-core/modules/dto/common.dto';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

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
