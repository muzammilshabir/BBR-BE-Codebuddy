import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdatePaymentInfoDto {
  @ApiProperty({ required: false, description: 'Payment status', enum: PaymentStatus })
  paymentStatus?: PaymentStatus;

  @ApiProperty({ required: false, description: 'Transaction ID' })
  transactionId?: string;

  @ApiProperty({ required: true, description: 'Plan ID', type: Types.ObjectId })
  planId: Types.ObjectId;
}

export const updatePaymentInfoSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  transactionId: Joi.string().optional(),
  planId: Joi.string().custom(joiObjectIdValidator('planId')).required(), 
}).min(1);
