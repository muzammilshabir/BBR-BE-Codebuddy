import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true })
export class Newsroom extends Document {

  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true, unique: true  })
  email: string;

  @Prop({ type: Boolean, default: true })
  isSubscribed: boolean;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const NewsroomSchema = SchemaFactory.createForClass(Newsroom);
