import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { isValidObjectId } from '@bbr/api-core/modules/custome-validations/custome-validations';
import {
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
}

export const updateResidenceSchema = Joi.object({
  name: Joi.string().optional(),
  residenceTypeId: Joi.string()
    .custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.message({ custom: 'Invalid ObjectId for residenceTypeId' });
      }
      return value;
    })
    .optional(),
  locationId: Joi.string()
    .custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.message({ custom: 'Invalid ObjectId for locationId' });
      }
      return value;
    })
    .optional(),
  websiteLink: Joi.string().optional(),
  associatedBrandId: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.message({ custom: 'Invalid ObjectId for associatedBrandId' });
      }
      return value;
    }),
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
});
