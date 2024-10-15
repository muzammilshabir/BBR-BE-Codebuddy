import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UpdateBuyerDto, UpdateSellerDto, updateUserSchema } from '../../users/dto/updateUser.dto';
import * as Joi from 'joi';
import { UserStatus } from '../../users/enum/user.enum';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

const omittedForBuyer = [
  'companyInfo',
  'contactPersonInfo',
  'companyName',
  'corporateEmail',
  'receiveLuxuryInsights',
  'fullName',
  'companyLogo',
  'yearEstablished',
  'briefCompanyDescription',
  'associatedBrandId',
];

export const updateBuyerProfileSchema = updateUserSchema.fork(omittedForBuyer, (schema) =>
  schema.forbidden()
);

export class UpdateBuyerProfileDto extends OmitType(UpdateBuyerDto, omittedForBuyer as never[]) {}

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

const omittedForSeller = ['contactInfo', 'preferences', 'receiveLuxuryInsights'];

export class UpdateSellerProfileDto extends OmitType(
  UpdateSellerDto,
  omittedForSeller as never[]
) {}

export const updateSellerProfileSchema = updateUserSchema.fork(omittedForSeller, (schema) =>
  schema.forbidden()
);

export class UpdateDeveloperStatusDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the developer',
    required: true,
  })
  developerId: string;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'The status of the user',
    required: true,
  })
  status: UserStatus;
}

export const UpdateDeveloperStatusSchema = Joi.object({
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).required(),
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .required(),
});
