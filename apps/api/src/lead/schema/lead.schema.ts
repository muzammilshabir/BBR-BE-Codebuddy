import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LeadSource, LeadStatus } from '../enum/lead-enum';
import { CounterService } from '../../counter/counter.service';
import { PhoneNumber, LeadUserPreferences, LeadUserContactInfo } from '../dto/create-lead.dto';

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
  @Prop({ required: false, unique: true })
  displayId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: PhoneNumber;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false, type: Object })
  contactInfo: LeadUserContactInfo;

  @Prop({ type: Types.ObjectId, ref: 'Residence', required: false })
  residenceId?: Types.ObjectId;

  @Prop({ required: false, type: Object })
  preferences: LeadUserPreferences;

  @Prop({ required: false })
  agreeToTerms: boolean;

  @Prop({ required: false })
  receiveNewsletter: boolean;

  @Prop({ required: false })
  companyName?: string;

  @Prop({ required: false })
  companyOrOrgLink?: string;

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

LeadSchema.pre('save', async function (next) {
  if (this.isNew) {
    const currentYear = new Date().getFullYear();
    const counterService = new CounterService(this.model('Counter'));

    const counter = await counterService.getNextSequence('Lead');

    // Format counter to have leading zeros (001, 002, etc.)
    const paddedCounter = counter.toString().padStart(3, '0');
    this.displayId = `L${currentYear}-${paddedCounter}`;
  }
  next();
});

export { LeadSchema };
