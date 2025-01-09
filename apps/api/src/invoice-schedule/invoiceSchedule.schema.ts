import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceScheduleStatus, RenewalFrequency } from './invoiceSchedule.enum';

@Schema({ timestamps: true, virtuals: true })
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

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'PaymentMethod' })
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

  @Prop({ type: Types.ObjectId, ref: 'PaymentMethod' })
  paymentMethodId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  reminderDays: number;

  @Prop({ type: Number, required: true })
  maxRenewalAttemptsCount: number;

  @Prop({ type: Number, required: true })
  attemptsFrequency: number;

  @Prop({ type: Number, required: true })
  gracePeriodDays: number;

  @Prop({ type: Date })
  nextInvoiceIssueDate: Date;

  @Prop({ type: Date })
  nextReminderDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  currentInvoiceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InvoiceSchedule' })
  invoiceScheduleId: Types.ObjectId;
}

export const InvoiceScheduleSchema = SchemaFactory.createForClass(InvoiceSchedule);

InvoiceScheduleSchema.set('toJSON', { virtuals: true });
InvoiceScheduleSchema.set('toObject', { virtuals: true });

InvoiceScheduleSchema.virtual('currentInvoice', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'invoiceScheduleId',
  justOne: true,
});

InvoiceScheduleSchema.virtual('plan', {
  ref: 'Plan',
  localField: 'planId',
  foreignField: '_id',
  justOne: true,
});

InvoiceScheduleSchema.virtual('paymentMethod', {
  ref: 'PaymentMethod',
  localField: 'paymentMethodId',
  foreignField: '_id',
  justOne: true,
});

InvoiceScheduleSchema.virtual('currentPaymentMethod', {
  ref: 'PaymentMethod',
  localField: 'currentPaymentMethodId',
  foreignField: '_id',
  justOne: true,
});

InvoiceScheduleSchema.virtual('invoiceSchedule', {
  ref: 'InvoiceSchedule',
  localField: 'invoiceScheduleId',
  foreignField: '_id',
  justOne: true,
});
