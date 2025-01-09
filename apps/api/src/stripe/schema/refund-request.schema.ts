import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RefundRequestStatus, RefundStatus } from '../enum/refund-status.enum';

@Schema({ timestamps: true })
export class RefundRequest extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  developerId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'RefundRequestReason' })
  reasonId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Upload' }] })
  uploadIds: Types.ObjectId[];

  @Prop({ type: String, required: false })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedById: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(RefundRequestStatus),
    default: RefundRequestStatus.REQUESTED,
  })
  status: RefundRequestStatus;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String })
  stripeRefundId?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: String, enum: Object.values(RefundStatus), default: RefundStatus.PENDING })
  refundStatus?: RefundStatus;
}

export const RefundRequestSchema = SchemaFactory.createForClass(RefundRequest);
