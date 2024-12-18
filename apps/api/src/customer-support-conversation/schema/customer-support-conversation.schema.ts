import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CustomerSupportConversation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'CustomerSupport', required: true })
  customerSupportId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: [{
      fileId: { type: Types.ObjectId, ref: 'Upload' },
      type: { type: String, required: false },
    }],
    _id: false,
    default: [],
  })
  attachments?: {
    fileId: Types.ObjectId;
    type?: string;
  }[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const CustomerSupportConversationSchema = SchemaFactory.createForClass(CustomerSupportConversation); 