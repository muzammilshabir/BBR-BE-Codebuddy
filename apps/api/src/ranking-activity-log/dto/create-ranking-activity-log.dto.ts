import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateRankingActivityLogDto {
  @ApiProperty({
    description: 'Ranking ID associated with the activity',
    example: '666666666666666666666666',
    required: false,
    type: String,
  })
  rankingId: string;

  @ApiProperty({
    description: 'Activity description',
    example: 'Maintenance visit',
    required: true,
    type: String,
  })
  activity: string;

  @ApiProperty({
    description: 'Optional notes about the activity',
    example: 'Checked the HVAC system',
    required: false,
    type: String,
  })
  notes?: string;

  @ApiProperty({
    description: 'Timestamp of the activity',
    example: new Date(),
    required: false,
    type: Date,
  })
  timestamp?: Date;
}

export const createRankingActivityLogSchema = Joi.object({
  rankingId: Joi.string().custom(joiObjectIdValidator('rankingId')).required(),
  activityType: Joi.string().required(),
  timestamp: Joi.date().iso().optional(),
});
