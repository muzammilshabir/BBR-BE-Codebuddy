import { ApiProperty } from '@nestjs/swagger';
import { Interval } from '../enum/interval.enum';
import * as Joi from 'joi';
class RecurringDto {
  @ApiProperty({
    enum: Interval,
    required: true,
    description: 'The interval of the recurring payment',
  })
  interval: Interval;

  @ApiProperty({
    description: 'The count of intervals',
    required: true,
    example: 1,
  })
  interval_count: number;
}

export class UpdateSubscriptionDto {

  @ApiProperty({
    type: () => RecurringDto,
    required: false,
    description: 'The recurring payment details',
  })
  recurring?: RecurringDto;

  @ApiProperty({
    description: 'The ID of the payment method',
    required: false,
    example: '33r2324sds423',
  })
  paymentMethodId?: string;

  @ApiProperty({
    description: 'The number of days for reminders',
    required: false,
    example: 7,
  })
  reminderDays?: number;

  @ApiProperty({
    description: 'The number of renewal attempts',
    required: false,
    example: 3,
  })
  renewalAttempts?: number;

  @ApiProperty({
    description: 'The frequency of attempts',
    required: false,
    example: 1,
  })
  attemptsFrequency?: number;

  @ApiProperty({
    description: 'The grace period in days',
    required: false,
    example: 7,
  })
  gracePeriod?: number;
}

export const updateSubscriptionDtoSchema = Joi.object({
  recurring: Joi.object({
    interval: Joi.string()
      .valid(...Object.values(Interval))
      .optional(),
    interval_count: Joi.number().optional(),
  }).optional(),
  paymentMethodId: Joi.string().optional(),
  reminderDays: Joi.number().optional(),
  renewalAttempts: Joi.number().optional(),
  attemptsFrequency: Joi.number().optional(),
  gracePeriod: Joi.number().optional(),
});
