import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Interval } from '../enum/lead-enum';

export class ListIntervalDto {
  @ApiProperty({
    example: Interval.YEARLY,
    enum: Interval,
    description: 'The status of the lead',
    required: true,
  })
  interval: Interval;
}

export const listIntervalSchema = Joi.object({
  interval: Joi.string()
    .valid(...Object.values(Interval))
    .required(),
});
