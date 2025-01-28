import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true })
  leadId: Types.ObjectId;

  @Prop({ required: true })
  activity: string;

  @Prop()
  note?: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

// Add compound indexes for common query patterns
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ leadId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ isDeleted: 1, createdAt: -1 });
