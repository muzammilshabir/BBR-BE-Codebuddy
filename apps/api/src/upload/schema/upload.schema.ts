import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MetadataType } from '../enum/metadataType-enum';

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

  @Prop({
    type: {
      referenceId: { type: Types.ObjectId, refPath: 'metadata.type', required: false },
      referenceType: {
        type: String,
        enum: Object.values(MetadataType),
        required: false,
      },
    },
    _id: false,
  })
  metadata?: {
    referenceId?: Types.ObjectId;
    referenceType?: MetadataType;
  };

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
