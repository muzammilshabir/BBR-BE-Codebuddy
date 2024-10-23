import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true })
export class InvoiceItem extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;

  @Prop({
    type: String,
    example: '33r232432423',
  })
  stripeProductId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Feature' })
  feature?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Plan' })
  plan?: Types.ObjectId;

  @Prop({
    type: Number,
    example: 1,
  })
  quantity: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: User;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);
