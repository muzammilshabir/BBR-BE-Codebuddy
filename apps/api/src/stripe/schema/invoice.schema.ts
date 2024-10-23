import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceStatus } from '../enum/invoice-status.enum';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({
    type: String,
    example: 'Monthly Promotional Payment',
  })
  membershipType: string;

  @Prop({
    type: String,
    example: '324sfsdr32r',
  })
  paymentMethodId: string;

  @Prop({
    type: Number,
    example: 5000,
  })
  discount: number;

  @Prop({
    type: Number,
    example: 5000,
  })
  tax: number;

  @Prop({
    type: String,
    example: 'Payment is required by mm/yy',
  })
  note: string;

  @Prop({
    type: String,
    enum: InvoiceStatus,
    example: 'draft',
  })
  status: InvoiceStatus;

  @Prop({
    type: String,
    example: 'sfhwkrhu23o',
    required: false,
  })
  stripeInvoiceId?: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Subscription' })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: Date })
  issuedAt: Date;

  @Prop({ type: Date })
  dueAt: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: User;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  developerId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
