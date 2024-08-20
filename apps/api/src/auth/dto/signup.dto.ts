import { PickType } from '@nestjs/swagger';
import { CreateUserDto, createUserSchema } from '../../users/dto/createUser.dto';

export const buyerSignupSchema = createUserSchema.fork(
  ['fullName', 'email', 'password', 'agreeToTerms'],
  (schema) => schema.required()
);

export class BuyerSignupDto extends PickType(CreateUserDto, [
  'fullName',
  'email',
  'password',
  'agreeToTerms',
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
