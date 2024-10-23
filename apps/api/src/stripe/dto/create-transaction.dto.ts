import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { TransactionStatus } from '../enum/transaction-status.enum';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the associated residence',
    required: true,
    type: String,
  })
  residenceId: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the residence\'s developer',
    required: true,
    type: String,
  })
  developerId: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the associated invoice',
    required: true,
    type: String,
  })
  invoiceId: Types.ObjectId;

  @ApiProperty({
    description: 'The transaction amount in cents',
    type: Number,
    required: true,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction status',
    type: String,
    enum: TransactionStatus,
    example: 'paid',
    required: true,
  })
  status: TransactionStatus;
}
