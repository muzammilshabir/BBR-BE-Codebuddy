import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { LeadSource, LeadStatus } from '../enum/lead-enum';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class PhoneNumber {
  @ApiProperty({ description: 'Country code of the phone number', example: '+1' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  number: string;
}

export class UpdateLeadDto {
  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: 'https://example.com/lead-page', required: false })
  pageUrl?: string;

  @ApiProperty({ example: 'USA', required: false })
  country?: string;

  @ApiProperty({
    example: "10000000 - 15000000",
    required: false
  })
  budget?: string;

  @ApiProperty({ 
    example: 13400000,
    description: "Price of the unit entered by the developer for this lead",
    required: false,
  })
  unitPrice?: string;

  @ApiProperty({ 
    example: 15,
    description: "n/a",
    required: false,
  })
  dealPercentage?: string;

  @ApiProperty({ example: 'Interested in beachfront properties', required: false })
  note?: string;

  @ApiProperty({
    example: LeadSource.WEBSITE_FORM,
    enum: LeadSource,
    required: false,
  })
  source?: LeadSource;

  @ApiProperty({
    example: LeadStatus.NEW,
    enum: LeadStatus,
    required: false,
  })
  status?: LeadStatus;

  @ApiProperty({ example: new Date, required: false })
  convertedAt?: Date;

  @ApiProperty({ example: new Date, required: false })
  contactedAt?: Date;

  @ApiProperty({ example: new Date, required: false })
  lastContactedAt?: Date;

  @ApiProperty({ example: new Date, required: false })
  expectedCloseDate?: Date;

  @ApiProperty({
    example: '+123456789',
    description: 'The phone number of the lead, in international format.',
    required: false,
  })
  phoneNumber?: PhoneNumber;

  @ApiProperty({ example: 'john@example.com', required: false })
  email?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: false, type: String })
  unitId?: Types.ObjectId;

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

export const updateLeadSchema = Joi.object({
  name: Joi.string().optional(),
  pageUrl: Joi.string().uri().optional(),
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
  unitPrice: Joi.number().min(0).optional(),
  dealPercentage: Joi.number().min(0).optional(),
  note: Joi.string().optional(),
  source: Joi.string()
    .valid(...Object.values(LeadSource))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(LeadStatus))
    .optional(),
  convertedAt: Joi.date().iso().optional(),
  contactedAt: Joi.date().iso().optional(),
  lastContactedAt: Joi.date().iso().optional(),
  expectedCloseDate: Joi.date().iso().optional(),
  phoneNumber: phoneSchema.optional(),
  email: Joi.string().email().optional(),
  unitId: Joi.string().optional().custom(joiObjectIdValidator('unitId')),
}).min(1);