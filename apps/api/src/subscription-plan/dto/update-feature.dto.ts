import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateFeatureDto {
  @ApiProperty({
    example: 'Includes all Basic Plan features',
    description: 'The name of the feature',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the feature is active',
    required: false,
  })
  active?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the plan is deleted',
    required: false,
  })
  isDeleted?: boolean;
}

export const updateFeatureDtoSchema = Joi.object({
  name: Joi.string().optional(),
  active: Joi.boolean().optional(),
  isDeleted: Joi.boolean().default(false),
});
