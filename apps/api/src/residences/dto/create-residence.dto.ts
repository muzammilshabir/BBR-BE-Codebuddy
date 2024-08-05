import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import * as Joi from 'joi';

export class BriefOverview {
  @ApiProperty({
    example: 'An idyllic coastal destination that combines natural beauty & iconic architecture',
    required: false,
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    example:
      'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
    required: false,
  })
  @IsString()
  @IsOptional()
  briefDescription?: string;
}

export class ComprehensiveOverview {
  @ApiProperty({
    example: 'An idyllic coastal destination that combines natural beauty & iconic architecture',
    required: false,
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    example:
      'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
    required: false,
  })
  @IsString()
  @IsOptional()
  generalDescription?: string;

  @ApiProperty({
    example: 'Fine dining, park and excellent schools just minutes away',
    required: false,
  })
  @IsString()
  @IsOptional()
  community?: string;

  @ApiProperty({ example: 'Enjoy modern upgrades with a newly remodeled kitchen', required: false })
  @IsString()
  @IsOptional()
  recentRenovation?: string;

  @ApiProperty({ example: 'Located in an upscale area with boutique shops', required: false })
  @IsString()
  @IsOptional()
  localAttractions?: string;

  @ApiProperty({ example: 'Exciting enhancement includes a new community center', required: false })
  @IsString()
  @IsOptional()
  futureDevelopmentPlans?: string;
}

export class BudgetLimitationsRange {
  @ApiProperty({ example: 10000, required: false })
  @IsNumber()
  @IsOptional()
  startRange?: number;

  @ApiProperty({ example: 200000, required: false })
  @IsNumber()
  @IsOptional()
  endRange?: number;
}

export class CreateResidenceDto {
  @ApiProperty({ example: 'Ritz Carlton Miami', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: true })
  residenceTypeId: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1a', required: true })
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ example: 'https://dummywebsite.com', required: false })
  @IsString()
  @IsOptional()
  websiteLink?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1b', required: false })
  @IsString()
  @IsOptional()
  associatedBrandId?: string;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => BriefOverview)
  @IsObject()
  @IsOptional()
  briefOverview?: BriefOverview;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => ComprehensiveOverview)
  @IsObject()
  @IsOptional()
  comprehensiveOverview?: ComprehensiveOverview;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => BudgetLimitationsRange)
  @IsObject()
  @IsOptional()
  budgetLimitationsRange?: BudgetLimitationsRange;
}

export const createResidenceSchema = Joi.object({
  name: Joi.string().required(),
  residenceTypeId: Joi.string().required(),
  locationId: Joi.string().required(),
  websiteLink: Joi.string().optional(),
  associatedBrandId: Joi.string().optional(),
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
