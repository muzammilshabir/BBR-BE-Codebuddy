import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class ChangeSubscriptionPaymentDto {
  @ApiProperty({
    example: "sdf3r23wed",
    required: true,
    type: String,
  })
  subscriptionId: string;

  @ApiProperty({
    example: 'sd32r23rw',
    required: true,
    type: String,
  })
  paymentMethodId: string;
}

export const changeSubscriptionPaymentDtoSchema = Joi.object({
  subscriptionId: Joi.string().required(),
  paymentMethodId: Joi.string().required(),
});
