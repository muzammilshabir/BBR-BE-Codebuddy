import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RefundStatus } from '../enum/refund-status.enum';

@Schema({ timestamps: true })
export class Refund extends Document {
  @Prop({
    type: String,
    example: '33r232432423',
  })
  invoiceId: Types.ObjectId;

  @Prop({
    type: Number,
    example: 'Amount to refund',
  })
  amount: number;

  @Prop({
    enum: RefundStatus,
    example: RefundStatus.REFUNDED,
  })
  status: RefundStatus;

  @Prop({
    type: String,
    example: 'Refund Reason',
  })
  reason: string;

  @Prop({
    type: String,
    example: 'Refund Notes',
  })
  note: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Upload' }],
    _id: false,
  })
  attachments: Types.ObjectId[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
