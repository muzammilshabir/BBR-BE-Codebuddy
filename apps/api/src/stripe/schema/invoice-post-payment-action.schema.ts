import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InvoicePostPaymentActionType {
  CREATE_USER = 'create_user',
  CREATE_RESIDENCE = 'create_residence',
  CREATE_RANKING_REQUEST = 'create_ranking_request',
  CREATE_FEATURE_REQUEST = 'create_feature_request',
  CREATE_BESPOKE_REQUEST = 'create_bespoke_request',
  CREATE_BBR_VERIFICATION_REQUEST = 'create_bbr_verification_request',
}

export type UserDetails = {
  fullName: string;
  password: string;
  email: string;
  phone?: {
    countryCode: string;
    number: string;
  };
  stripeCustomerId: string;
};

export type ResidenceDetails = {
  name: string;
  countryId: string;
  cityId: string;
  zipCode?: string;
  address1: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId: string;
};

export type UserInfo = {
  fullName: string;
  email: string;
};
export type RankingRequestDetails = {
  rankingCategoryIds: string[];
  userInfo?: UserInfo;
};

export type FeatureRequestDetails = {
  featurePlanId: string;
  residenceId: string;
  userInfo: UserInfo;
};

export type BbrVerificationRequestDetails = {
  bbrVerificationPlantId: string;
  residenceId: string;
  userInfo: UserInfo;
};

export type BespokeRequestDetails = {
  bespokeRequestId: string;
  userInfo: UserInfo;
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
  data:
    | UserDetails
    | ResidenceDetails
    | RankingRequestDetails
    | FeatureRequestDetails
    | BbrVerificationRequestDetails
    | BespokeRequestDetails;

  @Prop({ required: true, default: 0 })
  order: number;
}

export const InvoicePostPaymentActionSchema =
  SchemaFactory.createForClass(InvoicePostPaymentAction);
