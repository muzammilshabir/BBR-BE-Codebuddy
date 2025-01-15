import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefundRequestReason extends Document {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedById: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const RefundRequestReasonSchema = SchemaFactory.createForClass(RefundRequestReason);
