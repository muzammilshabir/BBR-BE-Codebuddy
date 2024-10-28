import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LoginStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class LoginAttempt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  loggedInUserId?: Types.ObjectId;

  @Prop({ required: true, enum: LoginStatus })
  status: LoginStatus;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
