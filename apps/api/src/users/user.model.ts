import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

enum UserType {
  Seller = 'Seller',
  Buyer = 'Buyer',
}

@Schema({ timestamps: true })
export class UserModel extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true, default: null })
  verificationToken: string | null;

  @Prop({ required: true, default: UserType.Seller })
  userType: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
