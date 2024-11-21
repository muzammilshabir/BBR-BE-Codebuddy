import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { Types } from 'mongoose';
import { InvoiceStatus } from '../enum/invoice-status.enum';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'The ID of the associated residence',
    required: true,
    type: String,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    description: 'The type of membership',
    example: 'Monthly Promotional Payment',
    required: true,
  })
  membershipType: string;

  @ApiProperty({
    description: 'The ID of the payment method',
    example: '324sfsdr32r',
    required: true,
  })
  paymentMethodId: string;

  @ApiProperty({
    description: 'The discount amount in cents',
    example: 5000,
    required: true,
  })
  discount: number;

  @ApiProperty({
    description: 'The tax amount in cents',
    example: 5000,
    required: true,
  })
  tax: number;

  @ApiProperty({
    description: 'Additional note for the invoice',
    example: 'Payment is required by mm/yy',
    required: false,
  })
  note?: string;

  @ApiProperty({
    description: 'Invoice Status',
    type: String,
    enum: ['draft', 'pending'],
    example: 'pending',
    required: true,
  })
  status: InvoiceStatus;

  @ApiProperty({
    description: 'The date when the invoice was issued',
    required: true,
    type: Date,
  })
  issuedAt: Date;

  @ApiProperty({
    description: 'The due date for the invoice',
    required: true,
    type: Date,
   })
  dueAt: Date;
}

export const createInvoiceDtoSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  membershipType: Joi.string().required(),
  paymentMethodId: Joi.string().required(),
  discount: Joi.number().min(0).required(),
  tax: Joi.number().min(0).max(100).required(),
  note: Joi.string().optional(),
  status: Joi.string().valid('pending', 'draft').required(),
  issuedAt: Joi.date().required(),
  dueAt: Joi.date().required(),
});
