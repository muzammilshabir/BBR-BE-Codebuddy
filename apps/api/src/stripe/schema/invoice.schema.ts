import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceStatus } from '../enum/invoice-status.enum';
import { User } from 'src/users/schema/user.schema';
import { PaymentMethod } from './payment-method.schema';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
 })
export class Invoice extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({
    type: String,
    example: 'Monthly Promotional Payment',
  })
  membershipType: string;

  @Prop({
    type: String,
    example: 'INV24-M10-0034',
    unique: true,
  })
  invoiceNumber: string;

  @Prop({
    type: String,
    example: '324sfsdr32r',
  })
  paymentMethodId: string;

  paymentMethod?: PaymentMethod;

  @Prop({
    type: Number,
    example: 5000,
    default: 0,
  })
  discount: number;

  @Prop({
    type: Number,
    example: 5,
    default: 0,
  })
  tax: number;

  @Prop({
    type: Number,
    example: 500000,
    default: 0,
  })
  subTotal: number;

  @Prop({
    type: String,
    example: 'Payment is required by mm/yy',
  })
  note: string;

  @Prop({
    type: String,
    enum: InvoiceStatus,
    example: 'draft',
  })
  status: InvoiceStatus;

  @Prop({
    type: String,
    example: 'sfhwkrhu23o',
    required: false,
  })
  stripeInvoiceId?: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Subscription' })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: Date })
  issuedAt: Date;

  @Prop({ type: Date })
  dueAt: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: User;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  developerId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.virtual('paymentMethod', {
  ref: 'PaymentMethod',
  localField: 'paymentMethodId',
  foreignField: 'paymentMethodId',
  justOne: true
});

InvoiceSchema.statics.generateInvoiceNumber = async function() {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  
  let sequence = 1;
  let invoiceNumber;
  let isUnique = false;

  while (!isUnique) {
    invoiceNumber = `INV${year}-M${month}-${sequence.toString().padStart(4, '0')}`;
    
    const existingInvoice = await this.findOne({ invoiceNumber });
    
    if (!existingInvoice) {
      isUnique = true;
    } else {
      sequence++;
    }
  }

  return invoiceNumber;
};

InvoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.invoiceNumber = await (this.constructor as any).generateInvoiceNumber();
  }
  next();
});

export { InvoiceSchema };
