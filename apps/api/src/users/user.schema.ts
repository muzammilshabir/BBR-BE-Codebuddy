import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from '../utils/user.type';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: false, default: null })
  verificationToken: string | null;

  @Prop({ required: true, ...Object.values(UserType) })
  userType: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
