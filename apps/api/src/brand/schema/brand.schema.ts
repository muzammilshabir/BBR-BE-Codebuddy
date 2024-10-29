import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Brand extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'BrandCategory' })
  brandCategoryId: Types.ObjectId;

  @Prop({
    type: [
      {
        ImageId: { type: Types.ObjectId, ref: 'Upload' },
        type: { type: String },
      },
    ],
    _id: false,
  })
  upload: {
    ImageId: Types.ObjectId;
    type: string;
  }[];

  @Prop({ type: Date })
  registeredDate: Date;

  @Prop({
    type: String,
    enum: ['active', 'pending', 'draft', 'flagged', 'rejected', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
