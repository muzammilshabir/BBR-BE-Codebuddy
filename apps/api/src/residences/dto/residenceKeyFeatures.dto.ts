import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import * as Joi from 'joi';

export enum RentalPotential {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum DevelopmentStatus {
  Completed = 'Completed',
  UnderConstruction = 'Under Construction',
  Planned = 'Planned',
}

export enum PetPolicy {
  PetFriendly = 'petFriendly',
  NoPetAllowed = 'No pet Allowed',
}

export class DevelopmentInfo {
  @ApiProperty({ example: 2020 })
  @IsNotEmpty()
  @IsNumber()
  yearOfBuild: number;

  @ApiProperty({ example: 'High' })
  @IsNotEmpty()
  @IsEnum(RentalPotential)
  rentalPotential: RentalPotential;

  @ApiProperty({ example: 'Completed' })
  @IsNotEmpty()
  @IsEnum(DevelopmentStatus)
  developmentStatus: DevelopmentStatus;

  @ApiProperty({ example: 1500 })
  @IsNotEmpty()
  @IsNumber()
  floorAreaSqFt: number;
}

export class AddKeyFeaturesDto {
  @ApiProperty({ example: ['feature1', 'feature2'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  featureIds: string[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => DevelopmentInfo)
  developmentInfo: DevelopmentInfo;

  @ApiProperty({ example: 'petFriendly' })
  @IsEnum(PetPolicy)
  petPolicy: PetPolicy;
}

export const addKeyFeaturesSchema = Joi.object({
  featureIds: Joi.array().items(Joi.string().required()).required(),
  developmentInfo: Joi.object({
    yearOfBuild: Joi.number().required(),
    rentalPotential: Joi.string()
      .valid(...Object.values(RentalPotential))
      .required(),
    developmentStatus: Joi.string()
      .valid(...Object.values(DevelopmentStatus))
      .required(),
    floorAreaSqFt: Joi.number().required(),
  }).required(),
  petPolicy: Joi.string()
    .valid(...Object.values(PetPolicy))
    .required(),
});
