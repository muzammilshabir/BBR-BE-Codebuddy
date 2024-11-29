import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { BillingCycle } from '../enum/billing-cycle-enum';

export class CreateFeatureRequestDto {
  @ApiProperty({
    example: '60d5f485f7c6a4b2b8e8b623',
    description: 'ID of the residence to be featured',
    required: true,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({ required: false, description: 'Payment status', enum: PaymentStatus })
  paymentStatus?: PaymentStatus;

  @ApiProperty({ example: '1234567890', description: 'Transaction ID', required: false })
  transactionId?: string;

  @ApiProperty({ required: true, description: 'Billing cycle', enum: BillingCycle })
  billingCycle: BillingCycle;
}

export const createFeatureRequestSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  transactionId: Joi.string().optional(),
  billingCycle: Joi.string()
    .valid(...Object.values(BillingCycle))
    .required(),
});
