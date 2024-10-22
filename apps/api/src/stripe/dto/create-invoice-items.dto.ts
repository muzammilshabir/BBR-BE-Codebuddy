import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class InvoiceItem {
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
    example: 30000,
    description: "30000 = $300.00 // price is always in cents",
    required: true,
  })
  price: number;
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
  invoiceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  invoiceItems: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
  })).required(),
});
