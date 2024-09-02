import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { DevelopmentStatus, PetPolicy, RentalPotential } from '../enum/residence-enum';

export class DevelopmentInfo {
  @ApiProperty({ example: 2020 })
  yearOfBuild: number;

  @ApiProperty({ example: 'High' })
  rentalPotential: RentalPotential;

  @ApiProperty({ example: 'Completed' })
  developmentStatus: DevelopmentStatus;

  @ApiProperty({ example: 1500 })
  floorAreaSqFt: number;
}

export class AddKeyFeaturesDto {
  @ApiProperty({ example: ['60d9c6a0a11c3c6c6a9a1a2a', '60d9c6a0a11c3c6c6a9a1a2b'] })
  featureIds: Types.ObjectId[];

  @ApiProperty()
  developmentInfo: DevelopmentInfo;

  @ApiProperty({ example: 'petFriendly' })
  petPolicy: PetPolicy;
}

export const addKeyFeaturesSchema = Joi.object({
  featureIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('featureIds')).required())
    .required(),
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
