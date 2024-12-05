import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { BillingCycle } from '../enum/billing-cycle-enum';

export class CreateFeatureRequestDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence to be featured',
    required: true,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({ example: '1234567890', description: 'Transaction ID', required: false })
  transactionId?: string;

  @ApiProperty({ required: false, description: 'Billing cycle', enum: BillingCycle })
  billingCycle: BillingCycle;

  @ApiProperty({
    required: false,
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'Plan ID',
    type: Types.ObjectId,
  })
  planId?: Types.ObjectId;
}

export const createFeatureRequestSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  transactionId: Joi.string().optional(),
  billingCycle: Joi.string()
    .valid(...Object.values(BillingCycle))
    .optional(),
  planId: Joi.string().custom(joiObjectIdValidator('planId')).optional(),
});
