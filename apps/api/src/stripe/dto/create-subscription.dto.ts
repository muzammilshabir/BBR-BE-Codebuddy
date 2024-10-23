import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Interval } from '../enum/interval.enum';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

class RecurringDto {
  @ApiProperty({
    enum: Interval,
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

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'The ID of the residence',
    type: String,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the associated invoice',
    type: String,
  })
  invoiceId: Types.ObjectId;

  @ApiProperty({
    type: () => RecurringDto,
    description: 'The recurring payment details',
  })
  recurring: RecurringDto;

  @ApiProperty({
    description: 'The ID of the payment method',
    required: true,
    example: '33r2324sds423',
  })
  paymentMethodId: string;

  @ApiProperty({
    description: 'The number of days for reminders',
    required: true,
    example: 7,
  })
  reminderDays: number;

  @ApiProperty({
    description: 'The number of renewal attempts',
    required: true,
    example: 3,
  })
  renewalAttempts: number;

  @ApiProperty({
    description: 'The frequency of attempts',
    required: true,
    example: 1,
  })
  attemptsFrequency: number;

  @ApiProperty({
    description: 'The grace period in days',
    required: true,
    example: 7,
  })
  gracePeriod: number;
}

export const createSubscriptionDtoSchema = Joi.object({
  invoiceId: Joi.string().custom(joiObjectIdValidator('invoiceId')).required(),
  recurring: Joi.object({
    interval: Joi.string()
      .valid(...Object.values(Interval))
      .required(),
    interval_count: Joi.number().required(),
  }).required(),
  paymentMethodId: Joi.string().required(),
  reminderDays: Joi.number().required(),
  renewalAttempts: Joi.number().required(),
  attemptsFrequency: Joi.number().required(),
  gracePeriod: Joi.number().required(),
});
