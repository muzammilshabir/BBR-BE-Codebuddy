import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class RefundPaymentDto {
  @ApiProperty({
    example: 10000,
    description: 'should be in cents',
    required: true,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    example: 'Requested by user',
    required: true,
    type: String,
  })
  note: string;

  @ApiProperty({
    example: 'dissatisfaction',
    required: true,
    type: String,
  })
  reason: string;
}

export const refundPaymentDtoSchema = Joi.object({
  amount: Joi.number().required(),
  note: Joi.string().required(),
  reason: Joi.string().required(),
});
