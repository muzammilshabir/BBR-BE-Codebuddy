import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

class CreateInvoiceItemCustom {
  @ApiProperty({
    example: 'XYZ Heights Residence',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 30000,
    description: '30000 = $300.00 // price is always in cents',
    required: true,
  })
  price: number;
}

class CreateInvoiceItemFeature {
  @ApiProperty({
    example: '66acda8b857c576159b74da2',
    type: String,
    required: true,
  })
  id: Types.ObjectId;

  @ApiProperty({
    example: 30000,
    description: '30000 = $300.00 // price is always in cents',
    required: true,
  })
  price: number;
}

export class InvoiceItem {
  @ApiProperty({
    description: 'Custom item name and price',
    type: CreateInvoiceItemCustom,
    required: false,
  })
  custom?: CreateInvoiceItemCustom;

  @ApiProperty({
    description: 'Feature item id and price',
    type: CreateInvoiceItemFeature,
    required: false,
  })
  feature?: CreateInvoiceItemFeature;

  @ApiProperty({
    description: 'Plan item id, the price will be taken from the plan',
    type: String,
    example: '66acda8b857c576159b74da2',
    required: false,
  })
  plan?: Types.ObjectId;
}

export class CreateInvoiceItemsDto {
  @ApiProperty({
    example: '60d9c6a0a11c3c6c6a9a132a',
    required: true,
    type: String,
  })
  invoiceId: Types.ObjectId;

  @ApiProperty({ required: true, type: InvoiceItem, isArray: true })
  invoiceItems: InvoiceItem[];
}

export const createInvoiceItemsDtoSchema = Joi.object({
  invoiceId: Joi.string().custom(joiObjectIdValidator('invoiceId')).required(),
  invoiceItems: Joi.array()
    .items(
      Joi.object({
        custom: Joi.object({
          name: Joi.string().required(),
          price: Joi.number().min(0).required(),
        }).optional(),
        feature: Joi.object({
          id: Joi.string().custom(joiObjectIdValidator('feature')).required(),
          price: Joi.number().min(0).required(),
        }).optional(),
        plan: Joi.string().custom(joiObjectIdValidator('plan')).optional(),
      }).xor('custom', 'feature', 'plan')
    )
    .required(),
});
