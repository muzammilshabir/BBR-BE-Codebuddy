import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class BriefOverview {
  @ApiProperty({
    example: 'An idyllic coastal destination that combines natural beauty & iconic architecture',
    required: false,
  })
  subtitle?: string;

  @ApiProperty({
    example:
      'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
    required: false,
  })
  briefDescription?: string;
}

export class ComprehensiveOverview {
  @ApiProperty({
    example: 'An idyllic coastal destination that combines natural beauty & iconic architecture',
    required: false,
  })
  subtitle?: string;

  @ApiProperty({
    example:
      'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
    required: false,
  })
  generalDescription?: string;

  @ApiProperty({
    example: 'Fine dining, park and excellent schools just minutes away',
    required: false,
  })
  community?: string;

  @ApiProperty({ example: 'Enjoy modern upgrades with a newly remodeled kitchen', required: false })
  recentRenovation?: string;

  @ApiProperty({ example: 'Located in an upscale area with boutique shops', required: false })
  localAttractions?: string;

  @ApiProperty({ example: 'Exciting enhancement includes a new community center', required: false })
  futureDevelopmentPlans?: string;
}

export class BudgetLimitationsRange {
  @ApiProperty({ example: 10000, required: false })
  startRange?: number;

  @ApiProperty({ example: 200000, required: false })
  endRange?: number;
}

export class CreateResidenceDto {
  @ApiProperty({ example: 'Ritz Carlton Miami', required: true })
  name: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: true, type: String })
  residenceTypeId: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1a', required: true, type: String })
  locationId: Types.ObjectId;

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

export const createResidenceSchema = Joi.object({
  name: Joi.string().required(),
  residenceTypeId: Joi.string().custom(joiObjectIdValidator('residenceTypeId')).required(),
  locationId: Joi.string().custom(joiObjectIdValidator('locationId')).required(),
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
});
