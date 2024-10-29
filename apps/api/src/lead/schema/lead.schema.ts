import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LeadSource, LeadStatus } from '../enum/lead-enum';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Lead extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Residence', required: false })
  residenceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: false })
  unitId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  developerId?: Types.ObjectId;

  @Prop({ required: false })
  pageUrl?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({
    required: false,
    example: 'range or specific number',
  })
  budget?: string;

  @Prop({
    required: false,
    example: 10000000,
  })
  unitPrice?: number;

  @Prop({ required: false })
  dealPercentage?: number;

  @Prop({ required: false })
  note?: string;

  @Prop({ required: false, enum: LeadSource, default: LeadSource.WEBSITE_FORM })
  source?: LeadSource;

  @Prop({ required: false })
  convertedAt?: Date;

  @Prop({ required: false })
  contactedAt?: Date;

  @Prop({ required: false })
  lastContactedAt?: Date;

  @Prop({ required: false })
  expectedCloseDate?: Date;

  @Prop({
    type: String,
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.virtual('user', {
  ref: 'User',
  localField: 'email',
  foreignField: 'email',
  justOne: true,
});

export { LeadSchema };
