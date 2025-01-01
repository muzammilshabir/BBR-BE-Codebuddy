import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BrandActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brandId: Types.ObjectId;

  @Prop({ required: true })
  activityType: string;

  @Prop({
    type: Map,
    of: String,
    default: {},
    required: false,
  })
  details?: Record<string, string>; // Flexible field for action-specific data like category names or status changes.

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BrandActivityLogSchema = SchemaFactory.createForClass(BrandActivityLog);
