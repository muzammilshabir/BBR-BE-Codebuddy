import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';

export const createRefundRequestSchema = Joi.object({
  invoiceId: Joi.string().required(),
  residenceId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  reasonId: Joi.string().required(),
  uploadIds: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional(),
});

export class CreateRefundRequestDto {
  @ApiProperty({
    example: 'in_1234567890',
    description: 'Stripe invoice ID',
    required: true,
  })
  invoiceId: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the residence',
    required: true,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    example: 100.0,
    description: 'Refund amount',
    required: true,
  })
  amount: number;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the refund reason',
    required: true,
  })
  reasonId: Types.ObjectId;

  @ApiProperty({
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of upload IDs for supporting documents',
    required: false,
    type: [String],
  })
  uploadIds?: Types.ObjectId[];

  @ApiProperty({
    example: 'Customer requested refund due to service issues',
    description: 'Additional notes about the refund request',
    required: false,
  })
  notes?: string;
}
