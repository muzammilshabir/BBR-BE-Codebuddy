import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { FeatureRequestStatus } from '../enum/feature-request-status';

export class UpdateFeatureRequestDto {
  @ApiProperty({ required: false, description: 'Feature request status', enum: FeatureRequestStatus })
  status?: FeatureRequestStatus;

  @ApiProperty({ required: false, description: 'Feature request start date' })
  featuredFrom?: Date;

  @ApiProperty({ required: false, description: 'Feature request end date' })
  featuredTo?: Date;

  @ApiProperty({ required: false, description: 'Feature request description' })
  featuredDescription?: string;

  @ApiProperty({ required: false, description: 'Feature request withdrawal date' })
  withdrawnOn?: Date;

  @ApiProperty({ required: false, description: 'Feature request rejection reason' })
  rejectedReason?: string;
}
  
export const updateFeatureRequestSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(FeatureRequestStatus))
    .optional(),
  featuredFrom: Joi.date().optional(),
  featuredTo: Joi.date().optional(),
  featuredDescription: Joi.string().optional().max(70),
  withdrawnOn: Joi.date().optional(),
  rejectedReason: Joi.string().optional(),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.status === FeatureRequestStatus.REJECTED && !value.rejectedReason) {
      return helpers.error('any.custom', {
        message: 'Rejected reason is required when status is REJECTED',
      });
    }
    return value;
  });
