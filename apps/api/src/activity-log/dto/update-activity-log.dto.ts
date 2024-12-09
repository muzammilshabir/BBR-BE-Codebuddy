import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateActivityLogDto {
  @ApiProperty({ example: 'Phone call with client', required: true })
  activity: string;

  @ApiProperty({ example: 'Discussed property requirements', required: false })
  note?: string;

  @ApiProperty({ example: new Date(), required: true })
  timestamp: Date;
}

export const updateActivityLogSchema = Joi.object({
  activity: Joi.string().optional(),
  note: Joi.string().optional(),
  timestamp: Joi.date().optional(),
});
