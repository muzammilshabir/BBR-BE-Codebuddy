import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { LeadSource } from '../enum/lead-enum';

export class PhoneNumber {
  @ApiProperty({ description: 'Country code of the phone number', example: '+1' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  number: string;
}

export class CreateLeadDto {
  @ApiProperty({ example: 'John Doe', required: true })
  name: string;

  @ApiProperty({
    example: '+123456789',
    description: 'The phone number of the lead, in international format.',
    required: true,
  })
  phoneNumber: PhoneNumber;

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

  @ApiProperty({ example: '100000-200000', required: false })
  budget?: string;

  @ApiProperty({ example: 'Interested in beachfront properties', required: false })
  note?: string;

  @ApiProperty({
    example: LeadSource.WEBSITE_FORM,
    enum: LeadSource,
    description: 'The source of the lead (e.g., website form). Default is WEBSITE_FORM.',
    required: false,
  })
  source?: LeadSource;
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

export const createLeadSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: phoneSchema.required(),
  email: Joi.string().required().email(),
  residenceId: Joi.string().optional().custom(joiObjectIdValidator('residenceId')),
  unitId: Joi.string().optional().custom(joiObjectIdValidator('unitId')),
  developerId: Joi.string().optional().custom(joiObjectIdValidator('developerId')),
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
