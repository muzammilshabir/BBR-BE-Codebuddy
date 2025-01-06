import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RankingActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'RankingRequest', required: false })
  rankingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RankingCategory', required: false })
  categoryId: Types.ObjectId;

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

export const RankingActivityLogSchema = SchemaFactory.createForClass(RankingActivityLog);
