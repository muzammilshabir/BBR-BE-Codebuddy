import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto, createUserSchema } from '../../users/dto/createUser.dto';
import { UserPhone } from '../../users/types/user.type';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const buyerSignupSchema = createUserSchema.fork(
  ['fullName', 'email', 'password', 'agreeToTerms', 'receiveLuxuryInsights'],
  (schema) => schema.required()
);

export class BuyerSignupDto extends PickType(CreateUserDto, [
  'fullName',
  'email',
  'password',
  'agreeToTerms',
  'receiveLuxuryInsights',
]) {}

export const sellerSignupSchema = createUserSchema.fork(
  [
    'fullName',
    'companyName',
    'corporateEmail',
    'password',
    'agreeToTerms',
    'receiveLuxuryInsights',
  ],
  (schema) => schema.required()
);

export class SellerSignupDto extends PickType(CreateUserDto, [
  'fullName',
  'companyName',
  'corporateEmail',
  'password',
  'agreeToTerms',
  'receiveLuxuryInsights',
]) {}

export class AddStaffMemberDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe', required: true })
  fullName: string;

  @ApiProperty({ description: 'Email of the user', example: 'johndoe@example.com', required: true })
  email: string;

  @ApiProperty({ description: 'Phone of the contact person', type: UserPhone, required: true })
  phone: UserPhone;

  @ApiProperty({
    description: 'Profile Avatar',
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  avatarImage?: Types.ObjectId;

  @ApiProperty({
    description: 'Profile Avatar',
    example: '66acda8b857c576159b74da4',
    required: true,
  })
  roleId: Types.ObjectId;
}

export const addStaffMemberSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.object({
    countryCode: Joi.string().required(),
    number: Joi.string().required(),
  }).required(),
  avatarImage: Joi.string().optional().custom(joiObjectIdValidator('avatarImage')),
  roleId: Joi.string().optional().custom(joiObjectIdValidator('roleId')),
});
