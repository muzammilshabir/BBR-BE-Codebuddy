import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { BillingCycle } from '../enum/billing-cycle-enum';

export class UpdatePaymentInfoDto {
  @ApiProperty({ required: false, description: 'Payment status', enum: PaymentStatus })
  paymentStatus?: PaymentStatus;

  @ApiProperty({ required: false, description: 'Transaction ID' })
  transactionId?: string;

  @ApiProperty({ required: false, description: 'Billing cycle', enum: BillingCycle })
  billingCycle?: BillingCycle;
}

export const updatePaymentInfoSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  transactionId: Joi.string().optional(),
  billingCycle: Joi.string()
    .valid(...Object.values(BillingCycle))
    .optional(),
}).min(1);
