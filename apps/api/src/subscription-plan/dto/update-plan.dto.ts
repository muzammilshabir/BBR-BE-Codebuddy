import { ApiProperty } from '@nestjs/swagger';
import { Interval } from '../enum/interval.enum';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
class Feature {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Id of the feature',
  })
  id: Types.ObjectId;

  @ApiProperty({
    description: 'Whether the feature is active for the plan',
    required: true,
    type: Boolean,
  })
  active: boolean;

  @ApiProperty({
    description: 'Order of the feature in plan',
    required: true,
    type: Number,
  })
  order: number;
}
export class UpdatePlanDto {
  @ApiProperty({
    example: 'Premium Residence Profile',
    description: 'The name of the plan',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 5000,
    description: 'The fee for the plan in cents',
    minimum: 0,
    required: false,
  })
  fee?: number;

  @ApiProperty({
    enum: Interval,
    example: Interval.MONTH,
    description: 'The billing cycle for the plan',
    required: false,
  })
  billingCycle?: Interval;

  @ApiProperty({
    example: 30,
    description: 'The trial period in days',
    minimum: 0,
    required: false,
  })
  trialPeriod?: number;

  @ApiProperty({
    description: 'The IDs of active features for this plan',
    type: Feature,
    isArray: true,
  })
  features?: Feature[];

  @ApiProperty({
    example: false,
    description: 'Whether the plan is active',
    required: false,
  })
  active?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the plan is deleted',
    required: false,
  })
  isDeleted?: boolean;
}

export const updatePlanDtoSchema = Joi.object({
  name: Joi.string().optional(),
  fee: Joi.number().min(0).optional(),
  billingCycle: Joi.string()
    .valid(...Object.values(Interval))
    .optional(),
  trialPeriod: Joi.number().integer().min(0).optional(),
  features: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().custom(joiObjectIdValidator('id')),
        active: Joi.boolean(),
        order: Joi.number().min(0),
      })
    )
    .optional(),
  active: Joi.boolean().optional(),
  isDeleted: Joi.boolean().default(false),
});
