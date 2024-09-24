import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import {
  Address,
  BriefOverview,
  BudgetLimitationsRange,
  ComprehensiveOverview,
} from './create-residence.dto';

export class UpdateResidenceDto {
  @ApiProperty({ example: 'Ritz Carlton Miami', required: false })
  name?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false, type: String })
  residenceTypeId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1a', required: false, type: String })
  locationId?: Types.ObjectId;

  @ApiProperty({ example: 'https://dummywebsite.com', required: false })
  websiteLink?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1b', required: false, type: String })
  associatedBrandId?: Types.ObjectId;

  @ApiProperty({ required: false })
  briefOverview?: BriefOverview;

  @ApiProperty({ required: false })
  comprehensiveOverview?: ComprehensiveOverview;

  @ApiProperty({ required: false })
  budgetLimitationsRange?: BudgetLimitationsRange;

  @ApiProperty({ required: false })
  address: Address;
}

export const updateResidenceSchema = Joi.object({
  name: Joi.string().optional(),
  residenceTypeId: Joi.string().optional().custom(joiObjectIdValidator('residenceTypeId')),
  locationId: Joi.string().optional().custom(joiObjectIdValidator('locationId')),
  websiteLink: Joi.string().optional(),
  associatedBrandId: Joi.string().optional().custom(joiObjectIdValidator('associatedBrandId')),
  briefOverview: Joi.object({
    subtitle: Joi.string().optional(),
    briefDescription: Joi.string().optional(),
  }).optional(),
  comprehensiveOverview: Joi.object({
    subtitle: Joi.string().optional(),
    generalDescription: Joi.string().optional(),
    community: Joi.string().optional(),
    recentRenovation: Joi.string().optional(),
    localAttractions: Joi.string().optional(),
    futureDevelopmentPlans: Joi.string().optional(),
  }).optional(),
  budgetLimitationsRange: Joi.object({
    startRange: Joi.number().optional(),
    endRange: Joi.number().optional(),
  }).optional(),
  address: Joi.object({
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().required(),
    userInput: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
    placeId: Joi.string().optional(),
  }).optional(),
});

export class RejectResidenceDto {
  @ApiProperty({
    description: 'The resone for the rejection',
    example: 'Invalid documents',
    required: true,
  })
  rejectionReason: string;
}

export const rejectResidenceSchema = Joi.object({
  rejectionReason: Joi.string().required(),
});
