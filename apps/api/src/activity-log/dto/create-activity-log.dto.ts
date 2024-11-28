import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateActivityLogDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: true })
  leadId: string;

  @ApiProperty({ example: 'Phone call with client', required: true })
  activity: string;

  @ApiProperty({ example: 'Discussed property requirements', required: false })
  note?: string;

  @ApiProperty({ example: new Date(), required: true })
  timestamp: Date;
}

export const createActivityLogSchema = Joi.object({
  leadId: Joi.string().required().custom(joiObjectIdValidator('leadId')),
  activity: Joi.string().required(),
  note: Joi.string().optional(),
  timestamp: Joi.date().required(),
}); 