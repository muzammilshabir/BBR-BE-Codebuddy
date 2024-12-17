import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FeatureRequestStatus } from '../enum/feature-request-status';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';

@Schema({ timestamps: true })
export class FeatureRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Residence', required: true })
  residenceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({
    type: String,
    enum: FeatureRequestStatus,
    default: FeatureRequestStatus.PENDING,
  })
  status: FeatureRequestStatus;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({ type: String })
  transactionId: string;

  @Prop({ type: Date })
  withdrawnOn: Date;

  @Prop({ type: Date })
  featuredFrom: Date;

  @Prop({ type: Date })
  featuredTo: Date;

  @Prop({ type: String })
  featuredDescription: string;

  @Prop({ type: String })
  rejectedReason: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const FeatureRequestSchema = SchemaFactory.createForClass(FeatureRequest);
