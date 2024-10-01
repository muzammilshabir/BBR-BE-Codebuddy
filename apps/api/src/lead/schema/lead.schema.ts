import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LeadSource, LeadStatus } from '../enum/lead-enum';

@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: false })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Residence', required: false })
  residenceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: false })
  unitId?: Types.ObjectId;

  @Prop({ required: false })
  pageUrl?: string;

  @Prop({ required: false })
  contactedAt?: Date;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false, enum: LeadSource })
  source?: LeadSource;

  @Prop({ required: false })
  convertedAt?: Date;

  @Prop({
    type: String,
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
