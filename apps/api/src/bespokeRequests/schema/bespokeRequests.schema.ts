import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { bespokeRequestStatus } from '../enum/bespoke-request-status';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';

@Schema({ timestamps: true })
export class BespokeRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Residence', required: false })
  residenceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: bespokeRequestStatus,
    default: bespokeRequestStatus.PENDING,
  })
  status: bespokeRequestStatus;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: [
      {
        featureName: { type: String, required: true },
        monthlyPrice: { type: Number, required: true },
        rankingCategoryId: { type: Types.ObjectId, ref: 'RankingCategory' },
        custom: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  features: Array<{
    featureName: string;
    monthlyPrice: number;
    rankingCategoryId: Types.ObjectId;
    custom: boolean;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'CustomerSupport', required: false })
  customerSupportId: Types.ObjectId;

  @Prop({ required: false })
  invoiceId: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const BespokeRequestSchema = SchemaFactory.createForClass(BespokeRequest);
