import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ClaimRequestStatus } from '../enum/claimReques-enum';

@Schema({ timestamps: true })
export class ClaimRequest extends Document {
  @Prop({ required: false })
  userName?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({
    required: false,
    type: {
      countryCode: { type: String, required: true },
      number: { type: String, required: true },
    },
    _id: false,
  })
  phoneNumber?: {
    countryCode: string;
    number: string;
  };

  @Prop({ required: false })
  companyName?: string;

  @Prop({ required: false })
  companyWebsite?: string;

  @Prop({ type: Types.ObjectId, ref: 'Residence', required: false })
  residenceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: false })
  unitId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  developerId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ClaimRequestStatus,
    required: true,
    default: ClaimRequestStatus.Pending,
  })
  status: ClaimRequestStatus;

  @Prop({
    type: String,
    example: 'Invalid Document',
    required: false,
  })
  rejectionReason?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Upload' }], required: false })
  documents?: Types.ObjectId[];

  @Prop({ required: false })
  acceptBBRCommitment: boolean;

  @Prop({ required: false })
  receiveLuxuryInsights: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ClaimRequestSchema = SchemaFactory.createForClass(ClaimRequest);
