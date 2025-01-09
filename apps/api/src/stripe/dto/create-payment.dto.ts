import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class PaymentItem {
  @ApiProperty({
    example: 'XYZ Heights Residence',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'Listing Subscription for XYZ Heights',
    required: true,
  })
  description: string;

  @ApiProperty({
    example: 'listing',
    required: true,
  })
  type: 'listing' | 'ranked' | 'featured';

  @ApiProperty({
    example: 30000,
    description: '30000 = $300.00 // price is always in cents',
    required: true,
  })
  price: number;

  @ApiProperty({
    example: 1,
    required: true,
  })
  quantity: number;
}

export class CreatePaymentDto {
  @ApiProperty({
    example: '60d9c6a0a11c3c6c6a9a132a',
    required: true,
    type: String,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({ required: true, type: PaymentItem, isArray: true })
  paymentItems: PaymentItem[];
}

export const createPaymentDtoSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  paymentItems: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        type: Joi.string().valid('ranked', 'featured', 'listing').required(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
      })
    )
    .required(),
});

export class CreatePaymentMethodDto {
  @ApiProperty({
    example: 'tok_1Qe91lD7a34iLGE0twqRjLen',
    required: true,
  })
  pmTokenId: string;

  @ApiProperty({
    example: 'buyer_123',
    required: true,
  })
  developerId: string;
}

export const createPaymentMethodDtoSchema = Joi.object({
  pmTokenId: Joi.string().required(),
  developerId: Joi.string().required(),
});
