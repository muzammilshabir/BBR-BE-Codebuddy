import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateFeatureDto {
  @ApiProperty({
    example: 'Includes all Basic Plan features',
    description: 'The name of the feature',
  })
  name: string;

  @ApiProperty({
    example: false,
    description: 'Whether the feature is active',
  })
  active: boolean;
}

export const createFeatureDtoSchema = Joi.object({
  name: Joi.string().required(),
  active: Joi.boolean().required(),
});
