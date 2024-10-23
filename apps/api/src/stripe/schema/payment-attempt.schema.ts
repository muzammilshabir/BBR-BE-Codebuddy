import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentAttemptStatus } from '../enum/payment-attempt-status.enum';

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
    enum: PaymentAttemptStatus,
    example: PaymentAttemptStatus.FAILED,
  })
  status: PaymentAttemptStatus;

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
