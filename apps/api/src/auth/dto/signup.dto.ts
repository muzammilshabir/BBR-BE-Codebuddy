import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto, createUserSchema } from '../../users/dto/createUser.dto';
import { UserPhone } from '../../users/types/user.type';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const buyerSignupSchema = createUserSchema.fork(
  ['fullName', 'email', 'password', 'agreeToTerms', 'receiveLuxuryInsights'],
  (schema) =>
    schema.required().messages({
      'any.required': 'Please fill in all required fields',
      'boolean.base': 'Please accept the terms and conditions to continue',
      'any.only': 'You must agree to the terms and conditions to proceed',
    })
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
  (schema) =>
    schema.required().messages({
      'any.required': 'Please fill in all required fields',
      'boolean.base': 'Please accept the terms and conditions to continue',
      'any.only': 'You must agree to the terms and conditions to proceed',
    })
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
  avatarImage: Joi.string().allow(null, '').optional().custom(joiObjectIdValidator('avatarImage')),
  roleId: Joi.string().optional().custom(joiObjectIdValidator('roleId')),
});

export class ClaimSellerDto {
  @ApiProperty({ example: 'John Doe', required: true })
  fullName: string;

  @ApiProperty({ example: 'Doe Realty', required: true })
  companyName: string;

  @ApiProperty({
    example: 'johndoe@company.com',
    description: 'Corporate email of the user',
    required: true,
  })
  corporateEmail: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Password for the seller',
    required: true,
  })
  password: string;

  @ApiProperty({
    example: '60d9c6a0a11c3c6c6a9a1a2a',
    description: 'Residence ID (ObjectId as string)',
    required: true,
  })
  residenceId: string;

  @ApiProperty({ description: 'User preference to receive luxury insights', example: true })
  receiveLuxuryInsights?: boolean;

  @ApiProperty({ description: 'User acceptance of BBR commitment', example: true })
  acceptBBRCommitment?: boolean;
}

export const claimSellerSchema = Joi.object({
  fullName: Joi.string().required(),
  companyName: Joi.string().required(),
  corporateEmail: Joi.string().email().required(),
  password: Joi.string()
    .trim()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
    .messages({
      'string.pattern.base':
        'password must be contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character',
    })
    .required(),
  residenceId: Joi.string().optional().custom(joiObjectIdValidator('residenceId')),
  receiveLuxuryInsights: Joi.boolean().optional(),
  acceptBBRCommitment: Joi.boolean().optional(),
});
