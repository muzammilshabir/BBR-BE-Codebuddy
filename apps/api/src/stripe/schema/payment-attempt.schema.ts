import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceStatus } from '../enum/invoice-status.enum';

@Schema({ timestamps: true })
export class PaymentAttempt extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;

  @Prop({
    type: Number,
    example: 1,
  })
  attemptNumber: number;

  @Prop({
    type: Number,
    example: 1,
  })
  attemptsRemaining: number;

  @Prop({
    type: Number,
    example: 1,
  })
  attemptsRemainingToday: number;

  @Prop({
    type: String,
    example: '324sfsdr32r',
  })
  paymentMethodId: string;

  @Prop({
    type: String,
    example: '324sfsdr32r',
  })
  stripeInvoiceId: string;

  @Prop({
    type: String,
    enum: ['failed', 'pending', 'succeeded'],
    example: 'failed',
  })
  status: InvoiceStatus;

  @Prop({
    type: Boolean,
    example: false,
    default: false,
  })
  managed: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PaymentAttemptSchema = SchemaFactory.createForClass(PaymentAttempt);
