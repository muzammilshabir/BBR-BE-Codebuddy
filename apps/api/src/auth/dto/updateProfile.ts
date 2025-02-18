import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { UpdateBuyerDto, UpdateSellerDto, updateUserSchema } from '../../users/dto/updateUser.dto';
import * as Joi from 'joi';
import { UserStatus } from '../../users/enum/user.enum';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { AddStaffMemberDto } from './signup.dto';
import { Types } from 'mongoose';
import {
  UserCompanyInfo,
  UserContactPersonInfo,
  UserNotificationPreferences,
} from '../../users/types/user.type';

const omittedForBuyer = [
  'companyInfo',
  'contactPersonInfo',
  'companyName',
  'corporateEmail',
  'receiveLuxuryInsights',
  'companyLogo',
  'yearEstablished',
  'briefCompanyDescription',
  'associatedBrandId',
];

export const updateBuyerProfileSchema = updateUserSchema
  .fork(omittedForBuyer, (schema) => schema.forbidden())
  .fork(['email'], (schema) => schema.optional());

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

const omittedForSeller = ['contactInfo', 'preferences', 'receiveLuxuryInsights', 'email'];

export class UpdateSellerProfileDto extends OmitType(
  UpdateSellerDto,
  omittedForSeller as never[]
) {}

export const updateSellerProfileSchema = updateUserSchema.fork(omittedForSeller, (schema) =>
  schema.forbidden()
);

export class UpdateUserStatusDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the user',
    required: true,
  })
  id: string;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'The status of the user',
    required: true,
  })
  status: UserStatus;
}

export const UpdateUserStatusSchema = Joi.object({
  id: Joi.string().custom(joiObjectIdValidator('id')).required(),
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .required(),
});

export class UpdateStaffMemberDto extends PartialType(AddStaffMemberDto) {
  @ApiProperty({
    description: 'Unique identifier of the staff member to be updated',
    example: '66acda8b857c576159b74da4',
    required: true,
  })
  staffMemberId: Types.ObjectId;
}

export const updateStaffMemberSchema = Joi.object({
  staffMemberId: Joi.string().required().custom(joiObjectIdValidator('staffMemberId')),
  fullName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.object({
    countryCode: Joi.string().optional(),
    number: Joi.string().optional(),
  }).optional(),
  avatarImage: Joi.string().allow(null, '').optional().custom(joiObjectIdValidator('avatarImage')),
  roleId: Joi.string().optional().custom(joiObjectIdValidator('roleId')),
});

export class ResetPasswordByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Residence',
    required: true,
  })
  userId: string;

  @ApiProperty({
    example: 'Pass@123',
    description: 'New Password',
  })
  password: string;
}

export const resetPasswordByIdSchema = Joi.object({
  userId: Joi.string().custom(joiObjectIdValidator('userId')).required(),
  password: Joi.string()
    .trim()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
    .messages({
      'string.pattern.base':
        'password must be contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character',
    }),
});

export class UpdateSellerByIdDto {
  @ApiProperty({ example: 'John Doe', required: false })
  fullName?: string;

  @ApiProperty({ example: 'corporate@example.com', required: false })
  corporateEmail?: string;

  @ApiProperty({ example: 'Example Corp', required: false })
  companyName?: string;

  @ApiProperty({ description: 'Company information', type: UserCompanyInfo, required: false })
  companyInfo?: UserCompanyInfo;

  @ApiProperty({
    description: 'Contact person information',
    type: UserContactPersonInfo,
    required: false,
  })
  contactPersonInfo?: UserContactPersonInfo;

  @ApiProperty({
    description: 'Notification preferences',
    type: UserNotificationPreferences,
    required: false,
  })
  notificationPreferences?: UserNotificationPreferences;

  @ApiProperty({
    description: 'Profile Avatar',
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  avatarImage?: Types.ObjectId;

  @ApiProperty({
    description: 'Company Logo',
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  companyLogo?: Types.ObjectId;

  @ApiProperty({ description: 'Year established', example: '2002', required: false })
  yearEstablished?: string;

  @ApiProperty({ example: 'Brief description about the company', required: false })
  briefCompanyDescription?: string;

  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: true,
  })
  associatedBrandId?: Types.ObjectId[];

  @ApiProperty({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'The status of the user',
    required: false,
  })
  status?: UserStatus;
}

export const updateSellerByIdSchema = Joi.object({
  fullName: Joi.string().optional(),
  corporateEmail: Joi.string().email().optional(),
  companyName: Joi.string().optional(),

  companyInfo: Joi.object({
    address: Joi.string().optional(),
    corporatePhone: Joi.object({
      countryCode: Joi.string().optional(),
      number: Joi.string().optional(),
    }).optional(),
    website: Joi.string().uri().optional(),
  }).optional(),

  contactPersonInfo: Joi.object({
    fullName: Joi.string().optional(),
    jobTitle: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.object({
      countryCode: Joi.string().optional(),
      number: Joi.string().optional(),
    }).optional(),
  }).optional(),

  notificationPreferences: Joi.object({
    latestNews: Joi.boolean().optional(),
    marketTrends: Joi.boolean().optional(),
    blogs: Joi.boolean().optional(),
    pushNotifications: Joi.boolean().optional(),
    emailNotifications: Joi.boolean().optional(),
  }).optional(),

  avatarImage: Joi.string().allow(null, '').optional().custom(joiObjectIdValidator('avatarImage')),
  companyLogo: Joi.string().allow(null, '').optional().custom(joiObjectIdValidator('companyLogo')),

  yearEstablished: Joi.string().optional(),
  briefCompanyDescription: Joi.string().optional(),

  associatedBrandId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('associatedBrandId')))
    .optional(),

  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .optional(),
});
