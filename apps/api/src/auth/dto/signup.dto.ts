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
