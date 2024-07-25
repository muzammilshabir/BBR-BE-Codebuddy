import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  userType: Joi.string().valid('Seller', 'Buyer').required(),
});

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Email of the user', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Password of the user', example: 'password123' })
  password: string;

  @ApiProperty({ description: 'User Type', enum: ['Seller', 'Buyer'] })
  userType: string;
}