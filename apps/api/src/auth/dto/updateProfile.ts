import { OmitType } from '@nestjs/swagger';
import { UpdateUserDto, updateUserSchema } from '../../users/dto/updateUser.dto';

const omittedForBuyer = [
  'companyInfo',
  'contactPersonInfo',
  'companyName',
  'corporateEmail',
  'receiveLuxuryInsights',
  'notificationPreferences',
  'preferences',
  'fullName',
];

export const updateBuyerProfileSchema = updateUserSchema.fork(omittedForBuyer, (schema) =>
  schema.forbidden()
);

export class UpdateBuyerProfileDto extends OmitType(UpdateUserDto, omittedForBuyer as never[]) {}
