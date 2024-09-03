import { OmitType } from '@nestjs/swagger';
import { CreateUserDto, createUserSchema } from './createUser.dto';

export const updateUserSchema = createUserSchema.fork(
  ['email', 'password', 'role', 'agreeToTerms', 'acceptBBRCommitment', 'signupMethod'],
  (schema) => schema.forbidden()
);

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'email',
  'password',
  'role',
  'agreeToTerms',
  'acceptBBRCommitment',
  'signupMethod',
  'isVerified',
  'emailVerificationToken',
  'emailVerified',
  'oAuthId',
  'resetPasswordToken',
  'verificationToken',
]) {}
