import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UpdateUserDto, updateUserSchema } from '../../users/dto/updateUser.dto';
import * as Joi from 'joi';

const omittedForBuyer = [
  'companyInfo',
  'contactPersonInfo',
  'companyName',
  'corporateEmail',
  'receiveLuxuryInsights',
  'fullName',
];

export const updateBuyerProfileSchema = updateUserSchema.fork(omittedForBuyer, (schema) =>
  schema.forbidden()
);

export class UpdateBuyerProfileDto extends OmitType(UpdateUserDto, omittedForBuyer as never[]) {}

export class AcceptBBRCommitment {
  @ApiProperty({
    example: true,
    required: true,
  })
  commitement: boolean;
}

export const acceptBBRCommitmentSchema = Joi.object({
  commitement: Joi.boolean().required(),
});
