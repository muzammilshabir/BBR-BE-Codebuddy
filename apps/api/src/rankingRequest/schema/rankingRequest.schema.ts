import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RankingRequestStatus } from '../enum/rankingRequest-status.enum'; // Enum for status
import { PaymentStatus } from '../enum/payment-status.enum';
import { RankingRequestNotification } from './rankingNotification.schema';
import { RankingImprovementOption } from '../enum/ranking-improvement-option.enum';

@Schema({ timestamps: true })
export class RankingRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  developerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RankingCategory', required: false })
  rankingCategoryId: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: String,
    enum: RankingImprovementOption,
    required: false,
  })
  rankingImprovementOption?: RankingImprovementOption;

  @Prop({
    type: [
      {
        criteriaId: { type: Types.ObjectId, required: true },
        score: { type: Number, required: true },
        description: { type: String, required: false },
      },
    ],
    _id: false,
    default: [],
  })
  criteriaScores: {
    criteriaId: Types.ObjectId;
    score: number;
    description?: string;
  }[];

  @Prop({
    type: [
      {
        ImageId: { type: Types.ObjectId, ref: 'Upload' },
        type: { type: String, required: false },
      },
    ],
    _id: false,
    default: [],
  })
  upload?: {
    ImageId: Types.ObjectId;
    type?: string;
  }[];

  @Prop({ required: false })
  bbrScore: number;

  @Prop({
    type: String,
    enum: RankingRequestStatus,
    required: false,
    default: RankingRequestStatus.DRAFT,
  })
  status: RankingRequestStatus;

  @Prop({ type: RankingRequestNotification, required: false })
  criteria: RankingRequestNotification;

  @Prop({
    type: String,
    example: 'Not enough details provided',
  })
  rejectionReason: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const RankingRequestSchema = SchemaFactory.createForClass(RankingRequest);
