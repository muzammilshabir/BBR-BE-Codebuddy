import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateSupportActivityLogDto {
  @ApiProperty({
    description: 'Support ID associated with the activity',
    example: '666666666666666666666666',
    required: true,
    type: String,
  })
  supportId: string;

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

export const createSupportActivityLogSchema = Joi.object({
  supportId: Joi.string().custom(joiObjectIdValidator('supportId')).required(),
  activity: Joi.string().required(),
  notes: Joi.string().optional(),
  timestamp: Joi.date().iso().optional(),
});
