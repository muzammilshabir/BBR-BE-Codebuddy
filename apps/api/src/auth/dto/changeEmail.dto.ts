import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const changeEmailSchema = Joi.object({
  oldEmail: Joi.string().email().required(),
  newEmail: Joi.string().email().required(),
});

export class ChangeEmailDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'oldemail@example.com',
  })
  oldEmail: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'newemail@example.com',
  })
  newEmail: string;
}
