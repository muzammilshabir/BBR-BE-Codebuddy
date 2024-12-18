import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BbrVerificationStatus } from '../enum/bbr-verification-status';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { VerificationType } from '../enum/verification-type.enum';

@Schema({ timestamps: true })
export class BbrVerification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Residence', required: true })
  residenceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: BbrVerificationStatus,
    default: BbrVerificationStatus.PENDING,
  })
  status: BbrVerificationStatus;

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

  @Prop({ type: String })
  rejectedReason: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({
    type: String,
    enum: VerificationType,
    required: true,
  })
  verificationType: VerificationType;

  @Prop({ type: Date })
  verifiedOn: Date;

  @Prop({ type: String })
  verificationInsight: string;
}

export const BbrVerificationSchema = SchemaFactory.createForClass(BbrVerification);
