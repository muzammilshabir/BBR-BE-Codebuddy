import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Upload extends Document {
  @Prop({ required: true })
  originalFileKey: string;

  @Prop({ required: true })
  fileKey: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  driver: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
