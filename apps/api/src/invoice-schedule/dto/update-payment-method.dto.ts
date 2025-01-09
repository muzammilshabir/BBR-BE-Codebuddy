import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentMethodDto {
  @ApiProperty({
    description: 'Payment method ID',
    example: '507f1f77bcf86cd799439011',
  })
  paymentMethodId: string;
}

export const updatePaymentMethodSchema = Joi.object({
  paymentMethodId: Joi.string().required().messages({
    'string.empty': 'Payment method ID is required',
    'any.required': 'Payment method ID is required',
  }),
});
