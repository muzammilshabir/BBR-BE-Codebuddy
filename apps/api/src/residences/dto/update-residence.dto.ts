import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import * as Joi from 'joi';
import {
  BriefOverview,
  BudgetLimitationsRange,
  ComprehensiveOverview,
} from './create-residence.dto';

export class UpdateResidenceDto {
  @ApiProperty({ example: 'Ritz Carlton Miami', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  residenceTypeId?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1a', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  locationId?: string;

  @ApiProperty({ example: 'https://dummywebsite.com', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  websiteLink?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1b', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  associatedBrandId?: string;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => BriefOverview)
  @IsObject()
  @IsOptional()
  @IsNotEmpty()
  briefOverview?: BriefOverview;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => ComprehensiveOverview)
  @IsObject()
  @IsOptional()
  @IsNotEmpty()
  comprehensiveOverview?: ComprehensiveOverview;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => BudgetLimitationsRange)
  @IsObject()
  @IsOptional()
  @IsNotEmpty()
  budgetLimitationsRange?: BudgetLimitationsRange;
}

export const updateResidenceSchema = Joi.object({
  name: Joi.string().optional(),
  residenceTypeId: Joi.string().optional(),
  locationId: Joi.string().optional(),
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
