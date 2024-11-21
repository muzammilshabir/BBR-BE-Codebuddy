import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InvoicePostPaymentActionType {
  CREATE_USER = 'create_user',
  CREATE_RESIDENCE = 'create_residence',
}

export type UserDetails = {
  fullName: string;
  password: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  };
  stripeCustomerId: string;
};

export type ResidenceDetails = {
  name: string;
  countryId: string;
  cityId: string;
  zipCode: string;
  address1: string;
};

@Schema({ timestamps: true })
export class InvoicePostPaymentAction extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Invoice', index: true })
  invoiceId: Types.ObjectId;

  @Prop({ required: true, enum: InvoicePostPaymentActionType })
  type: InvoicePostPaymentActionType;

  @Prop({
    type: Object,
    _id: false,
  })
  data: UserDetails | ResidenceDetails;
}

export const InvoicePostPaymentActionSchema =
  SchemaFactory.createForClass(InvoicePostPaymentAction);
