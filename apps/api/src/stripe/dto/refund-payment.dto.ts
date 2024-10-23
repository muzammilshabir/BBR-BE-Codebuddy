import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';


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

  @ApiProperty({ example: [
    '66acda8b857c576159b74da2',
    '66acda8b857c576159b75da5'
  ], required: false })
  attachments: Types.ObjectId[];
}

export const refundPaymentDtoSchema = Joi.object({
  amount: Joi.number().required(),
  note: Joi.string().required(),
  reason: Joi.string().required(),
  attachments: Joi.array()
  .items(Joi.string().custom(joiObjectIdValidator('attachments')))
  .required(),
});
