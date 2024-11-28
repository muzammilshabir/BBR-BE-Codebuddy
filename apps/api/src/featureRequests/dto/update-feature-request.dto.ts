import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { FeatureRequestStatus } from '../enum/feature-request-status';

export class UpdateFeatureRequestDto {
  @ApiProperty({ required: false })
  status?: FeatureRequestStatus;

  @ApiProperty({ required: false })
  featuredFrom?: Date;

  @ApiProperty({ required: false })
  featuredTo?: Date;

  @ApiProperty({ required: false })
  featuredDescription?: string;

  @ApiProperty({ required: false })
  withdrawnOn?: Date;
}

export const updateFeatureRequestSchema = Joi.object({
  status: Joi.string().valid(...Object.values(FeatureRequestStatus)).optional(),
  featuredFrom: Joi.date().optional(),
  featuredTo: Joi.date().optional(),
  featuredDescription: Joi.string().optional(),
  withdrawnOn: Joi.date().optional(),
}).min(1); 