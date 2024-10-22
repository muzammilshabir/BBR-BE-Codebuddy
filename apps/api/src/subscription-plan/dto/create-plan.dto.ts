import { ApiProperty } from '@nestjs/swagger';
import { Interval } from '../enum/interval.enum';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreatePlanDto {
  @ApiProperty({
    example: 'Premium Residence Profile',
    description: 'The name of the plan',
  })
  name: string;

  @ApiProperty({
    example: 5000,
    description: 'The fee for the plan in cents',
    minimum: 0,
  })
  fee: number;

  @ApiProperty({
    enum: Interval,
    example: Interval.MONTH,
    description: 'The billing cycle for the plan',
  })
  billingCycle: Interval;

  @ApiProperty({
    example: 30,
    description: 'The trial period in days',
    minimum: 0,
  })
  trialPeriod: number;

  @ApiProperty({
    description: 'The IDs of active features for this plan',
    type: [String],
  })
  features: Types.ObjectId[];

  @ApiProperty({
    example: false,
    description: 'Whether the plan is active',
  })
  active: boolean;
}

export const createPlanDtoSchema = Joi.object({
  name: Joi.string().required(),
  fee: Joi.number().min(0).required(),
  billingCycle: Joi.string().valid(...Object.values(Interval)).required(),
  trialPeriod: Joi.number().integer().min(0).required(),
  features: Joi.array()
  .items(Joi.string().custom(joiObjectIdValidator('features')))
  .required(),
  active: Joi.boolean().required(),
});
