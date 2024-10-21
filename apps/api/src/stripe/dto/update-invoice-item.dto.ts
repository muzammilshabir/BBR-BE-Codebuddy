import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateInvoiceItemDto {
  @ApiProperty({
    example: 'XYZ Heights Residence',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'Listing Subscription for XYZ Heights',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 30000,
    description: "30000 = $300.00 // price is always in cents",
    required: false,
  })
  price?: number;
}

export const updateInvoiceItemsDtoSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
});
