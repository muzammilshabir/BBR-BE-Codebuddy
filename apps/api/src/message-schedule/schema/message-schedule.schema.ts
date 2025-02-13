import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CometChatReceiverType } from 'src/users/types/comet-chat.type';

@Schema({ timestamps: true })
export class MessageSchedule extends Document {
  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  receiverId: string;

  @Prop({ required: true, enum: CometChatReceiverType })
  receiverType: CometChatReceiverType;

  @Prop({ required: true })
  messageText: string;

  @Prop({ required: true })
  datetime: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false })
  isSent: boolean;
}

export const MessageScheduleSchema = SchemaFactory.createForClass(MessageSchedule);
