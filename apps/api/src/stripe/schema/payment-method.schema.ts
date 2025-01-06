import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentMethod extends Document {
  @Prop({
    type: String,
    example: '33r232432423',
  })
  customerId: Types.ObjectId;

  @Prop({
    type: String,
    example: '33r232432423',
  })
  paymentMethodId: string;

  @Prop({
    type: String,
    example: '33r232432423',
  })
  mandateId: string;

  @Prop({
    type: String,
    example: '1234',
  })
  last4Digit: string;

  @Prop({
    type: String,
    example: 'Visa',
  })
  brand: string;

  @Prop({
    type: String,
    example: '12',
  })
  expiryMonth: string;

  @Prop({
    type: String,
    example: '2025',
  })
  expiryYear: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
