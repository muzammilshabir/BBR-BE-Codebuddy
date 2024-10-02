import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SignupMethod, UserRole } from '../enum/user.enum';
import {
  UserCompanyInfo,
  UserContactInfo,
  UserContactPersonInfo,
  UserNotificationPreferences,
  UserPreferences,
} from '../types/user.type';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: false })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true, enum: SignupMethod })
  signupMethod: SignupMethod;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: false, default: null })
  verificationToken: string | null;

  @Prop({ required: false })
  oAuthId?: string;

  @Prop({ required: false })
  emailVerificationToken?: string;

  @Prop({ required: false })
  resetPasswordToken?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ required: false })
  companyName?: string;

  @Prop({ required: false })
  corporateEmail: string;

  @Prop({ required: false })
  agreeToTerms: boolean;

  @Prop({ required: false })
  receiveLuxuryInsights: boolean;

  @Prop({ required: false })
  acceptBBRCommitment: boolean;

  @Prop({ required: false })
  fcm_token: string;

  @Prop({ required: false, type: Boolean, default: false })
  hundredFiveStarReviews: boolean;

  @Prop({ required: false, type: Object })
  companyInfo: UserCompanyInfo;

  @Prop({ required: false, type: Object })
  contactPersonInfo: UserContactPersonInfo;

  @Prop({ required: false, type: Object })
  contactInfo: UserContactInfo;

  @Prop({ required: false, type: Object })
  preferences: UserPreferences;

  @Prop({ required: false, type: [String], default: [] })
  reviewWordsForAlert: string[];

  @Prop({ required: false, type: Object })
  notificationPreferences: UserNotificationPreferences;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Upload' })
  avatarImage: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
