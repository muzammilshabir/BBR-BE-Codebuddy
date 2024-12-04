import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { CustomerSupportSource, Priority, Role } from '../enum/customer-support-enum';
import { UserBudget, UserContactInfo } from 'src/users/types/user.type';
import { UserContactMethod } from 'src/users/enum/user.enum';
import { budgetSchema } from 'src/users/dto/createUser.dto';
import {
  CustomerSupportFeatureRequest,
  CustomerSupportErrorReport,
  CalendlyDetails,
} from '../type/customer-support.type';

export class CustomerSupportUserPreferences {
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

export class PhoneNumber {
  @ApiProperty({ description: 'Country code of the phone number', example: '+1' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  number: string;
}

export class CreateCustomerSupportDto {
  @ApiProperty({ example: 'John Doe', required: true })
  name: string;

  @ApiProperty({
    description: 'The phone number of the lead, in international format.',
    required: true,
  })
  phoneNumber?: PhoneNumber;

  @ApiProperty({ example: 'john@example.com', required: true })
  email: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false, type: String })
  residenceId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: false, type: String })
  unitId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2c', required: false, type: String })
  developerId?: Types.ObjectId;

  @ApiProperty({ example: 'https://example.com/lead-page', required: false })
  pageUrl?: string;

  @ApiProperty({ example: 'USA', required: false })
  country?: string;

  @ApiProperty({ description: 'Contact information', type: UserContactInfo, required: false })
  contactInfo?: UserContactInfo;

  @ApiProperty({
    description: 'User preferences',
    type: CustomerSupportUserPreferences,
    required: false,
  })
  preferences?: CustomerSupportUserPreferences;

  @ApiProperty({ example: 'Interested in beachfront properties', required: false })
  note?: string;

  @ApiProperty({ example: 'company name', required: false })
  companyName?: string;

  @ApiProperty({
    example: 'https://www.google.com/',
    description: 'company or organization website link',
    required: false,
  })
  websiteUrl?: string;

  @ApiProperty({ description: 'User agreement to terms', example: true })
  agreeToTerms?: boolean;

  @ApiProperty({ description: 'User preference to receive news letter ', example: true })
  receiveNewsletter?: boolean;

  @ApiProperty({
    example: CustomerSupportSource.HOME,
    enum: CustomerSupportSource,
    description: 'The source of the lead (e.g., website form). Default is HOME.',
    required: false,
  })
  source?: CustomerSupportSource;

  @ApiProperty({ description: 'Message from the customer', required: false })
  message?: string;

  @ApiProperty({
    enum: Priority,
    description: 'Priority level of the support request',
    required: false,
  })
  priority?: Priority;

  @ApiProperty({
    type: CustomerSupportFeatureRequest,
    description: 'Feature request details',
    required: false,
  })
  customerSupportFeatureRequest?: CustomerSupportFeatureRequest;

  @ApiProperty({
    type: CustomerSupportErrorReport,
    description: 'Error report details',
    required: false,
  })
  customerSupportErrorReport?: CustomerSupportErrorReport;

  @ApiProperty({ 
    type: CalendlyDetails,
    required: false,
    description: 'Calendly meeting details' 
  })
  calendlyDetails?: CalendlyDetails;
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
  countryId: Joi.string().required(),
  phone: phoneSchema.required(),
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

export const customerSupportFeatureRequestSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(Role))
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Role must be one of: seller, buyer, visitor',
    }),
  featurePageLink: Joi.string().uri().required().messages({
    'string.uri': 'Feature page link must be a valid URL',
    'any.required': 'Feature page link is required',
  }),
  featureDescription: Joi.string().required().messages({
    'any.required': 'Feature description is required',
  }),
  documents: Joi.array().items(
    Joi.string().custom(joiObjectIdValidator('documents'))
  ).optional(),
});

export const customerSupportErrorReportSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(Role))
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Role must be one of: seller, buyer, visitor',
    }),
  errorPageLink: Joi.string().uri().required().messages({
    'string.uri': 'Error page link must be a valid URL',
    'any.required': 'Error page link is required',
  }),
  errorDescription: Joi.string().required().messages({
    'any.required': 'Error description is required',
  }),
  documents: Joi.array().items(
    Joi.string().custom(joiObjectIdValidator('documents'))
  ).optional(),
});

export const locationDetailsSchema = Joi.object({
  location: Joi.string().uri().required().messages({
    'string.uri': 'Location must be a valid URL',
    'any.required': 'Location is required',
  }),
  type: Joi.string().required().messages({
    'any.required': 'Type is required',
  }),
});

export const calendlyDetailsSchema = Joi.object({
  createdAt: Joi.date().iso().required(),
  meetingStart: Joi.date().iso().required(),
  meetingName: Joi.string().optional(),
  location: locationDetailsSchema.optional(),
  cancelUrl: Joi.string().uri().optional(),
  rescheduleUrl: Joi.string().uri().optional(),
});

export const createCustomerSupportSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: phoneSchema.optional(),
  email: Joi.string().required().email(),
  residenceId: Joi.string().optional().custom(joiObjectIdValidator('residenceId')),
  unitId: Joi.string().optional().custom(joiObjectIdValidator('unitId')),
  developerId: Joi.string().optional().custom(joiObjectIdValidator('developerId')),
  contactInfo: contactInfoSchema.optional(),
  preferences: preferencesSchema.optional(),
  agreeToTerms: Joi.boolean().valid(true),
  receiveNewsletter: Joi.boolean(),
  companyName: Joi.string().optional(),
  websiteUrl: Joi.string().uri().optional(),
  pageUrl: Joi.string().optional().uri(),
  country: Joi.string().optional(),
  note: Joi.string().optional(),
  source: Joi.string()
    .valid(...Object.values(CustomerSupportSource))
    .optional(),
  message: Joi.string().optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  customerSupportFeatureRequest: customerSupportFeatureRequestSchema.optional(),
  customerSupportErrorReport: customerSupportErrorReportSchema.optional(),
  calendlyDetails: calendlyDetailsSchema.optional(),
}).options({ stripUnknown: true });
