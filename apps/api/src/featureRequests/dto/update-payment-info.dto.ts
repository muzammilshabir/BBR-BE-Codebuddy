import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { BillingCycle } from '../enum/billing-cycle-enum';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdatePaymentInfoDto {
  @ApiProperty({ required: false, description: 'Payment status', enum: PaymentStatus })
  paymentStatus?: PaymentStatus;

  @ApiProperty({ required: false, description: 'Transaction ID' })
  transactionId?: string;

  @ApiProperty({ required: false, description: 'Billing cycle', enum: BillingCycle })
  billingCycle?: BillingCycle;

  @ApiProperty({ required: false, description: 'Plan ID', type: Types.ObjectId })
  planId?: Types.ObjectId;
}

export const updatePaymentInfoSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  transactionId: Joi.string().optional(),
  billingCycle: Joi.string()
    .valid(...Object.values(BillingCycle))
    .optional(),
  planId: Joi.string().custom(joiObjectIdValidator('planId')).optional(), 
}).min(1);
