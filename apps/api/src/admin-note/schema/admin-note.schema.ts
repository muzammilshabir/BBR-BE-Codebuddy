import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AdminNote extends Document {
  @Prop({ type: Types.ObjectId, ref: 'CustomerSupport', required: true })
  customerSupportId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AdminNoteSchema = SchemaFactory.createForClass(AdminNote);

AdminNoteSchema.index({ createdAt: -1 });