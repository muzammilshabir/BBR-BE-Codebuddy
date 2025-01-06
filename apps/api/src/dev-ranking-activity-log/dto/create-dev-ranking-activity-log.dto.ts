import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateDevRankingActivityLogDto {
  @ApiProperty({
    description: 'Ranking ID associated with the activity',
    example: '666666666666666666666666',
    required: true,
    type: String,
  })
  rankingId: string;

  @ApiProperty({
    description: 'Activity type',
    example: 'Follow-up call',
    required: true,
    type: String,
  })
  activityType: string;

  @ApiProperty({
    description: 'Details about the activity',
    example: { status: 'Completed', notes: 'Client responded positively' },
    required: false,
    type: Object,
  })
  details?: Record<string, string>;

  @ApiProperty({
    description: 'User ID associated with the activity',
    example: '777777777777777777777777',
    required: false,
    type: String,
  })
  userId?: string;

  @ApiProperty({
    description: 'Indicates if the activity log is deleted',
    example: false,
    required: false,
    type: Boolean,
  })
  isDeleted?: boolean;

  @ApiProperty({
    description: 'Timestamp of creation',
    example: new Date().toISOString(),
    required: false,
    type: String,
  })
  createdAt?: string;

  @ApiProperty({
    description: 'Timestamp of last update',
    example: new Date().toISOString(),
    required: false,
    type: String,
  })
  updatedAt?: string;
}

export const createDevRankingActivityLogSchema = Joi.object({
  rankingId: Joi.string().custom(joiObjectIdValidator('rankingId')).required(),
  activityType: Joi.string().required(),
  details: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  userId: Joi.string().custom(joiObjectIdValidator('userId')).optional(),
  isDeleted: Joi.boolean().optional(),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});
