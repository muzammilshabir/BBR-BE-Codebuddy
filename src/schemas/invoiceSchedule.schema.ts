import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class InvoiceSchedule extends Document {
  @Prop({
    type: String,
    example: '33r232432423',
  })
  buyerId: Types.ObjectId;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
