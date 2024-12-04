import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CustomerSupportSource, CustomerSupportStatus, Priority } from '../enum/customer-support-enum';
import { CounterService } from '../../counter/counter.service';
import { CustomerSupportUserPreferences, PhoneNumber } from '../dto/create-customer-support.dto';
import { UserContactInfo } from 'src/users/types/user.type';
import { CustomerSupportErrorReport, CustomerSupportFeatureRequest } from '../type/customer-support.type';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CustomerSupport extends Document {
  @Prop({ required: false, unique: true })
  displayId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  phoneNumber: PhoneNumber;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  message: string;

  @Prop({ required: false, type: Object })
  contactInfo: UserContactInfo;

  @Prop({ type: Types.ObjectId, ref: 'Residence', required: false })
  residenceId?: Types.ObjectId;

  @Prop({ required: false })
  agreeToTerms: boolean;

  @Prop({ required: false })
  companyName?: string;

  @Prop({ required: false })
  websiteUrl?: string;

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
    example: 10000000,
  })
  unitPrice?: number;

  @Prop({ required: false })
  note?: string;

  @Prop({
    required: false,
    enum: CustomerSupportSource,
  })
  source?: CustomerSupportSource;
  
  @Prop({ required: false, type: Object })
  preferences: CustomerSupportUserPreferences;

  @Prop({
    required: false,
    enum: Priority,
  })
  priority?: Priority;

  @Prop({
    required: false,
    type: CustomerSupportFeatureRequest,
  })
  customerSupportFeatureRequest?: CustomerSupportFeatureRequest;

  @Prop({
    required: false,
    type: CustomerSupportErrorReport,
  })
  customerSupportErrorReport?: CustomerSupportErrorReport;

  @Prop({
    required: false,
    type: [Types.ObjectId],
    ref: 'User',
  })
  assignedTo?: Types.ObjectId[];

  @Prop({
    type: String,
    enum: CustomerSupportStatus,
    default: CustomerSupportStatus.NEW,
  })
  status: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

}

const CustomerSupportSchema = SchemaFactory.createForClass(CustomerSupport);

CustomerSupportSchema.virtual('user', {
  ref: 'User',
  localField: 'email',
  foreignField: 'email',
  justOne: true,
});

CustomerSupportSchema.pre('save', async function (next) {
  if (this.isNew) {
    const currentYear = new Date().getFullYear();
    const counterService = new CounterService(this.model('Counter'));

    const counter = await counterService.getNextSequence('CustomerSupport');

    // Format counter to have leading zeros (001, 002, etc.)
    const paddedCounter = counter.toString().padStart(3, '0');
    this.displayId = `C${currentYear}-${paddedCounter}`;
  }
  next();
});

export { CustomerSupportSchema };
