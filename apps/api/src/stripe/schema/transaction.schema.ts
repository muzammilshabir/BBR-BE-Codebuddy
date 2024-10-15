import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({
    type: String,
    example: '33r232432423',
  })
  invoiceId: string;

  @Prop({
    type: String,
    example: '324sfsdr32r',
  })
  subscriptionId: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
