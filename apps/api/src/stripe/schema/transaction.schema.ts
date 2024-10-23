import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionStatus } from '../enum/transaction-status.enum';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  developerId: Types.ObjectId;
  
  @Prop({ required: true, type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: string;

  @Prop({
    type: Number,
    example: 500000, // in cents
  })
  amount: number;

  @Prop({
    type: String,
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
