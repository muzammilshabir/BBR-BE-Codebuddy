import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { InvoiceStatus } from '../enum/invoice-status.enum';

export class UpdateInvoiceDto {

  @ApiProperty({
    description: 'The type of membership',
    example: 'Monthly Promotional Payment',
    required: false,
  })
  membershipType?: string;

  @ApiProperty({
    description: 'The ID of the payment method',
    example: '324sfsdr32r',
    required: false,
  })
  paymentMethodId?: string;

  @ApiProperty({
    description: 'The discount amount in cents',
    example: 5000,
    required: false,
  })
  discount?: number;

  @ApiProperty({
    description: 'The tax amount in cents',
    example: 5000,
    required: false,
  })
  tax?: number;

  @ApiProperty({
    description: 'Additional note for the invoice',
    example: 'Payment is required by mm/yy',
    required: false,
  })
  note?: string;

  @ApiProperty({
    description: 'Additional note for the invoice',
    type: String,
    enum: ['draft', 'pending', 'canceled'],
    example: 'pending',
    required: false,
  })
  status?: InvoiceStatus;


  @ApiProperty({
    description: 'The date when the invoice was issued',
    required: false,
  })
  issuedAt?: Date;

  @ApiProperty({
    description: 'The due date for the invoice',
    required: false,
   })
  dueAt?: Date;

  @ApiProperty({
    description: 'Mark the invoice as deleted',
    required: false,
    type: Boolean,
   })
   isDeleted?: boolean;
}

export const updateInvoiceDtoSchema = Joi.object({
  membershipType: Joi.string().optional(),
  paymentMethodId: Joi.string().optional(),
  discount: Joi.number().optional(),
  tax: Joi.number().optional(),
  note: Joi.string().optional(),
  status: Joi.string().valid('pending', 'draft', 'canceled').optional(),
  issuedAt: Joi.date().optional(),
  dueAt: Joi.date().optional(),
  isDeleted: Joi.boolean().optional(),
});
