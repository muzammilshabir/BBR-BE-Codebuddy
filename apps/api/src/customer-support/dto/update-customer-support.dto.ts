import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import {
  CustomerSupportSource,
  CustomerSupportStatus,
  Priority,
} from '../enum/customer-support-enum';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import {
  contactInfoSchema,
  preferencesSchema,
  CustomerSupportUserPreferences,
  customerSupportFeatureRequestSchema,
  customerSupportErrorReportSchema,
  calendlyDetailsSchema,
  CustomerSupportUserContactInfo,
} from './create-customer-support.dto';
import {
  CustomerSupportFeatureRequest,
  CustomerSupportErrorReport,
  CalendlyDetails,
} from '../type/customer-support.type';

export class PhoneNumber {
  @ApiProperty({ description: 'Country code of the phone number', example: '+1' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  number: string;
}

export class UpdateCustomerSupportDto {
  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: 'https://example.com/lead-page', required: false })
  pageUrl?: string;

  @ApiProperty({ example: 'USA', required: false })
  country?: string;

  @ApiProperty({
    example: 13400000,
    description: 'Price of the unit entered by the developer for this lead',
    required: false,
  })
  unitPrice?: string;

  @ApiProperty({
    type: Object,
    description: 'Extra details',
    required: false,
    example: { key: 'value' },
  })
  other?: Object;

  @ApiProperty({
    example: 15,
    description: 'n/a',
    required: false,
  })
  dealPercentage?: string;

  @ApiProperty({ example: 'Interested in beachfront properties', required: false })
  note?: string;

  @ApiProperty({
    example: CustomerSupportSource.HOME,
    enum: CustomerSupportSource,
    required: false,
  })
  source?: CustomerSupportSource;

  @ApiProperty({
    example: CustomerSupportStatus.NEW,
    enum: CustomerSupportStatus,
    required: false,
  })
  status?: CustomerSupportStatus;

  @ApiProperty({ example: new Date(), required: false })
  convertedAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  contactedAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  lastContactedAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  expectedCloseDate?: Date;

  @ApiProperty({
    description: 'The phone number of the lead, in international format.',
    required: false,
  })
  phoneNumber?: PhoneNumber;

  @ApiProperty({ example: 'john@example.com', required: false })
  email?: string;

  @ApiProperty({ example: 'company name', required: false })
  companyName?: string;

  @ApiProperty({
    example: 'https://www.google.com/',
    description: 'company or organization website link',
    required: false,
  })
  companyOrOrgLink?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: false, type: String })
  unitId?: Types.ObjectId;

  @ApiProperty({
    description: 'Contact information',
    type: CustomerSupportUserContactInfo,
    required: false,
  })
  contactInfo?: CustomerSupportUserContactInfo;

  @ApiProperty({
    description: 'User preferences',
    type: CustomerSupportUserPreferences,
    required: false,
  })
  preferences?: CustomerSupportUserPreferences;

  @ApiProperty({
    enum: Priority,
    description: 'Priority level of the support request',
    required: false,
  })
  priority?: Priority;

  @ApiProperty({
    description: 'Array of upload objects',
    example: [{ ImageId: '60d7fe6f9eb1f24a04d65633', type: 'docs' }],
    required: false,
    type: Array,
  })
  upload?: Array<{
    ImageId: Types.ObjectId;
    type?: string;
  }>;

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

  @ApiProperty({ example: ['60d9c6a0a11c3c6c6a9a1a2b'], required: false })
  assignedTo?: Types.ObjectId[];

  @ApiProperty({
    type: CalendlyDetails,
    required: false,
    description: 'Calendly meeting details',
  })
  calendlyDetails?: CalendlyDetails;
}

const phoneSchema = Joi.object({
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

export const updateCustomerSupportSchema = Joi.object({
  name: Joi.string().optional(),
  pageUrl: Joi.string().uri().optional(),
  country: Joi.string().optional(),
  unitPrice: Joi.number().min(0).optional(),
  dealPercentage: Joi.number().min(0).optional(),
  other: Joi.object().optional(),
  note: Joi.string().optional(),
  source: Joi.string()
    .valid(...Object.values(CustomerSupportSource))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(CustomerSupportStatus))
    .optional(),
  convertedAt: Joi.date().iso().optional(),
  contactedAt: Joi.date().iso().optional(),
  lastContactedAt: Joi.date().iso().optional(),
  expectedCloseDate: Joi.date().iso().optional(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        type: Joi.string().optional(),
      })
    )
    .optional(),
  phoneNumber: phoneSchema.optional(),
  email: Joi.string().email().optional(),
  companyName: Joi.string().optional(),
  companyOrOrgLink: Joi.string().uri().optional(),
  unitId: Joi.string().optional().custom(joiObjectIdValidator('unitId')),
  contactInfo: contactInfoSchema.optional(),
  preferences: preferencesSchema.optional(),
  assignedTo: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('assignedTo')))
    .optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  customerSupportFeatureRequest: customerSupportFeatureRequestSchema.optional(),
  customerSupportErrorReport: customerSupportErrorReportSchema.optional(),
  calendlyDetails: calendlyDetailsSchema.optional(),
}).min(1);
