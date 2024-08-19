import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { SignupMethod, UserContactMethod, UserRole } from '../enum/user.enum';
import {
  UserContactInfo,
  UserContactPersonInfo,
  UserNotificationPreferences,
  UserPreferences,
} from '../types/user.type';
import { UserCompanyInfo } from './../types/user.type';

export const phoneSchema = Joi.object({
  countryCode: Joi.string().required(),
  number: Joi.string().required(),
});

export const companyInfoSchema = Joi.object({
  address: Joi.string().required(),
  corporatePhone: phoneSchema.required(),
  website: Joi.string().uri().required(),
});

export const contactPersonInfoSchema = Joi.object({
  fullName: Joi.string().required(),
  jobTitle: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: phoneSchema.required(),
});

export const contactInfoSchema = Joi.object({
  locationId: Joi.string().required(),
  phone: phoneSchema.required(),
  preferredContactMethods: Joi.array()
    .items(Joi.string().valid(...Object.values(UserContactMethod)))
    .required(),
});

export const budgetSchema = Joi.object({
  min: Joi.number().required(),
  max: Joi.number()
    .required()
    .when('min', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('min')),
    })
    .messages({
      'number.greater': 'budget "max" must be greater than "min"',
    }),
});

export const preferencesSchema = Joi.object({
  residenceTypeIds: Joi.array().items(Joi.string()).required(),
  locationIds: Joi.array().items(Joi.string()).required(),
  lifeStyleIds: Joi.array().items(Joi.string()).required(),
  budget: budgetSchema.required(),
});

export const notificationPreferencesSchema = Joi.object({
  latestNews: Joi.boolean(),
  marketTrends: Joi.boolean(),
  blogs: Joi.boolean(),
  pushNotifications: Joi.boolean(),
  emailNotifications: Joi.boolean(),
});

export const createUserSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string()
    .trim()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
    .messages({
      'string.pattern.base':
        'password must be contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character',
    }),
  signupMethod: Joi.string().valid(...Object.values(SignupMethod)),
  role: Joi.string().valid(...Object.values(UserRole)),
  fullName: Joi.string(),
  companyName: Joi.string(),
  corporateEmail: Joi.string().email(),
  agreeToTerms: Joi.boolean().valid(true),
  receiveLuxuryInsights: Joi.boolean(),
  acceptBBRCommitment: Joi.boolean(),
  companyInfo: companyInfoSchema.optional(),
  contactPersonInfo: contactPersonInfoSchema.optional(),
  contactInfo: contactInfoSchema.optional(),
  preferences: preferencesSchema.optional(),
  notificationPreferences: notificationPreferencesSchema.optional(),
});

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  fullName: string;

  @ApiProperty({ description: 'Email of the user', example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ description: 'Password of the user', example: 'strongpassword123' })
  password: string;

  @ApiProperty({ description: 'Method used for signup', enum: SignupMethod })
  signupMethod: SignupMethod;

  @ApiProperty({ description: 'Role of the user', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Indicates if the user is verified', example: false })
  isVerified?: boolean;

  @ApiProperty({
    description: 'Verification token for email verification',
    example: 'abc123',
    required: false,
  })
  verificationToken?: string;

  @ApiProperty({
    description: 'OAuth ID for third-party logins',
    example: 'google-oauth-id',
    required: false,
  })
  oAuthId?: string;

  @ApiProperty({
    description: 'Token for email verification',
    example: 'email-verification-token',
    required: false,
  })
  emailVerificationToken?: string;

  @ApiProperty({
    description: 'Token for resetting the password',
    example: 'reset-password-token',
    required: false,
  })
  resetPasswordToken?: string;

  @ApiProperty({ description: 'Indicates if the email is verified', example: false })
  emailVerified?: boolean;

  @ApiProperty({
    description: 'Token for forgotten password',
    example: 'forgot-password-token',
    required: false,
  })
  forgotPasswordToken?: string;

  @ApiProperty({ description: 'Company name', example: 'Example Corp', required: false })
  companyName?: string;

  @ApiProperty({ description: 'Corporate email of the user', example: 'corporate@example.com' })
  corporateEmail?: string;

  @ApiProperty({ description: 'User agreement to terms', example: true })
  agreeToTerms?: boolean;

  @ApiProperty({ description: 'User preference to receive luxury insights', example: true })
  receiveLuxuryInsights?: boolean;

  @ApiProperty({ description: 'User acceptance of BBR commitment', example: true })
  acceptBBRCommitment?: boolean;

  @ApiProperty({ description: 'Company information', type: UserCompanyInfo, required: false })
  companyInfo?: UserCompanyInfo;

  @ApiProperty({
    description: 'Contact person information',
    type: UserContactPersonInfo,
    required: false,
  })
  contactPersonInfo?: UserContactPersonInfo;

  @ApiProperty({ description: 'Contact information', type: UserContactInfo, required: false })
  contactInfo?: UserContactInfo;

  @ApiProperty({ description: 'User preferences', type: UserPreferences, required: false })
  preferences?: UserPreferences;

  @ApiProperty({
    description: 'Notification preferences',
    type: UserNotificationPreferences,
    required: false,
  })
  notificationPreferences?: UserNotificationPreferences;
}
