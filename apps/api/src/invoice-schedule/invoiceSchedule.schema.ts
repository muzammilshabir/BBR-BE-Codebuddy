import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceScheduleStatus, RenewalFrequency } from './invoiceSchedule.enum';

@Schema({ timestamps: true })
export class InvoiceSchedule extends Document {
  @Prop({
    type: String,
    enum: Object.values(InvoiceScheduleStatus),
    default: InvoiceScheduleStatus.DRAFT,
  })
  status: InvoiceScheduleStatus;

  @Prop({ type: Types.ObjectId, required: true })
  developerId: Types.ObjectId;

  @Prop({ required: true })
  buyerEmail: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ type: Types.ObjectId, required: true })
  residenceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: Types.ObjectId })
  currentPaymentMethodId: Types.ObjectId;

  @Prop({
    type: [
      {
        featureId: { type: Types.ObjectId },
        featureName: { type: String },
        unitAmount: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  })
  features: Array<{
    featureId?: Types.ObjectId;
    featureName?: string;
    unitAmount: number;
    quantity: number;
  }>;

  @Prop({ type: Number, default: 0 })
  discountAmount: number;

  @Prop({ type: Number, required: true })
  taxPercentage: number;

  @Prop({ type: String })
  notes: string;

  @Prop({
    type: String,
    enum: Object.values(RenewalFrequency),
    required: true,
  })
  renewalFrequency: RenewalFrequency;

  @Prop({ type: Types.ObjectId })
  paymentMethodId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  reminderDays: number;

  @Prop({ type: Number, required: true })
  maxRenewalAttemptsCount: number;

  @Prop({ type: Number, required: true })
  attemptsFrequency: number;

  @Prop({ type: Number, required: true })
  gracePeriodDays: number;

  @Prop({ type: Boolean, default: false })
  publish: boolean;

  @Prop({ type: Date })
  nextInvoiceIssueDate: Date;

  @Prop({ type: Types.ObjectId })
  currentInvoiceId: Types.ObjectId;
}

export const InvoiceScheduleSchema = SchemaFactory.createForClass(InvoiceSchedule);
