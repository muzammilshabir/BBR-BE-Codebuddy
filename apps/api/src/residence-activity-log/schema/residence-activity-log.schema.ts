import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ResidenceActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Residence', required: true })
  residenceId: Types.ObjectId;

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

export const ResidenceActivityLogSchema = SchemaFactory.createForClass(ResidenceActivityLog);
