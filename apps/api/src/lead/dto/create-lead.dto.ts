import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { LeadSource } from '../enum/lead-enum';
import { UserBudget } from 'src/users/types/user.type';
import { UserContactMethod } from 'src/users/enum/user.enum';
import { budgetSchema } from 'src/users/dto/createUser.dto';

export class PhoneNumber {
  @ApiProperty({ description: 'Country code of the phone number', example: '+1' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  number: string;
}

export class LeadUserContactInfo {
  @ApiProperty({
    description: 'Location ID associated with the contact',
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  countryId?: string;

  @ApiProperty({ description: 'Phone information', type: PhoneNumber, required: false })
  phone?: PhoneNumber;

  @ApiProperty({ description: 'Preferred contact methods', enum: UserContactMethod, isArray: true })
  preferredContactMethods: UserContactMethod[];
}

export class LeadUserPreferences {
  @ApiProperty({
    description: 'IDs of preferred residence types',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
  })
  residenceTypeIds?: Types.ObjectId[];

  @ApiProperty({
    description: 'IDs of preferred locations',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
    required: false,
  })
  locationIds?: Types.ObjectId[];

  @ApiProperty({
    description: 'IDs of preferred brands',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
    required: false,
  })
  brandIds?: Types.ObjectId[];

  @ApiProperty({
    description: 'IDs of preferred lifestyle options',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
  })
  lifeStyleIds?: Types.ObjectId[];

  @ApiProperty({ description: 'Budget preferences', type: UserBudget })
  budget: UserBudget;
}

export class CreateLeadDto {
  @ApiProperty({ example: 'John Doe', required: true })
  name: string;

  @ApiProperty({
    description: 'The phone number of the lead, in international format.',
    required: false,
    type: PhoneNumber,
  })
  phoneNumber?: PhoneNumber;

  @ApiProperty({ example: 'john@example.com', required: true })
  email: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false, type: String })
  residenceId?: string;

  @ApiProperty({
    description: 'Price of the unit',
    example: 1000000,
    required: false,
  })
  unitPrice?: number;

  @ApiProperty({
    description: 'Percentage of the deal',
    example: 25,
    required: false,
  })
  dealPercentage?: number;

  @ApiProperty({
    description: 'value of the deal',
    example: 25,
    required: false,
  })
  dealValue?: number;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: false, type: String })
  unitId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2c', required: false, type: String })
  developerId?: Types.ObjectId;

  @ApiProperty({ example: 'https://example.com/lead-page', required: false })
  pageUrl?: string;

  @ApiProperty({ example: 'USA', required: false })
  country?: string;

  @ApiProperty({ description: 'Contact information', type: LeadUserContactInfo, required: false })
  contactInfo?: LeadUserContactInfo;

  @ApiProperty({ example: '100000-200000', required: false })
  budget?: string;

  @ApiProperty({ description: 'User preferences', type: LeadUserPreferences, required: false })
  preferences?: LeadUserPreferences;

  @ApiProperty({ example: 'Interested in beachfront properties', required: false })
  note?: string;

  @ApiProperty({ example: 'company name', required: false })
  companyName?: string;

  @ApiProperty({
    example: 'https://www.google.com/',
    description: 'company or organization website link',
    required: false,
  })
  companyOrOrgLink?: string;

  @ApiProperty({ description: 'User agreement to terms', example: true })
  agreeToTerms?: boolean;

  @ApiProperty({ description: 'User preference to receive news letter ', example: true })
  receiveNewsletter?: boolean;

  @ApiProperty({
    example: LeadSource.WEBSITE_FORM,
    enum: LeadSource,
    description: 'The source of the lead (e.g., website form). Default is WEBSITE_FORM.',
    required: false,
  })
  source?: LeadSource;

  @ApiProperty({
    type: Object,
    description: 'Extra details',
    required: false,
    example: { key: 'value' },
  })
  other?: unknown;

  @ApiProperty({ example: '2024-11-28', description: 'Expected close date', required: false })
  expectedCloseDate?: Date;
}

export const phoneSchema = Joi.object({
  countryCode: Joi.string()
    .pattern(/^\+[1-9]\d{0,2}$/)
    .messages({
      'string.pattern.base':
        'Country code must start with + and contain 1-3 digits (e.g., +1, +44, +971)',
    }),
  number: Joi.string()
    .pattern(/^[1-9]\d{6,14}$/)
    .messages({
      'string.pattern.base':
        'Phone number must be between 7 and 15 digits without spaces or special characters',
    }),
});

export const contactInfoSchema = Joi.object({
  countryId: Joi.string().optional(),
  phone: phoneSchema.optional(),
  preferredContactMethods: Joi.array()
    .items(Joi.string().valid(...Object.values(UserContactMethod)))
    .required(),
});

export const preferencesSchema = Joi.object({
  residenceTypeIds: Joi.array().items(Joi.string()).required(),
  locationIds: Joi.array().items(Joi.string()).optional(),
  brandIds: Joi.array().items(Joi.string()).optional(),
  lifeStyleIds: Joi.array().items(Joi.string()).required(),
  budget: budgetSchema.required(),
});

export const createLeadSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: phoneSchema.optional(),
  email: Joi.string().required().email(),
  other: Joi.object().optional(),
  residenceId: Joi.string().optional(),
  unitId: Joi.string().optional().custom(joiObjectIdValidator('unitId')),
  developerId: Joi.string().optional().custom(joiObjectIdValidator('developerId')),
  contactInfo: contactInfoSchema.optional(),
  preferences: preferencesSchema.optional(),
  agreeToTerms: Joi.boolean().valid(true),
  receiveNewsletter: Joi.boolean(),
  companyName: Joi.string().optional(),
  companyOrOrgLink: Joi.string().uri().optional(),
  unitPrice: Joi.number().optional(),
  dealPercentage: Joi.number().optional(),
  dealValue: Joi.number().optional(),
  expectedCloseDate: Joi.date().optional(),
  pageUrl: Joi.string().optional().uri(),
  country: Joi.string().optional(),
  budget: Joi.string()
    .pattern(/^\d+$|^\d+\s*-\s*\d+$|^\d+\+$/)
    .custom((value, helpers) => {
      if (value.includes('-')) {
        const [min, max] = value.split('-').map((v) => parseInt(v.trim(), 10));
        if (min > max) {
          return helpers.error('any.invalid', {
            message: 'The lower bound of the budget cannot be greater than the upper bound.',
          });
        }
      }
      return value;
    })
    .messages({
      'string.pattern.base':
        'Budget must be a number, a range (e.g., "1000-2000"), or an open-ended value (e.g., "1000+").',
      'any.invalid': '{{#message}}',
    })
    .optional(),
  note: Joi.string().optional(),
  source: Joi.string()
    .valid(...Object.values(LeadSource))
    .optional(),
});
