import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { LeadSource, LeadStatus } from '../enum/lead-enum';

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
}

export const updateLeadSchema = Joi.object({
  name: Joi.string().optional(),
  pageUrl: Joi.string().uri().optional(),
  country: Joi.string().optional(),
  budget: Joi.string().pattern(/^\d+(\s*-\s*\d+|\s*\+)?$/).messages({
    'string.pattern.base': 'Budget must be a number or a range (e.g., "1000", "1000 - 2000", or "1000+")'
  }).optional(),
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
}).min(1);