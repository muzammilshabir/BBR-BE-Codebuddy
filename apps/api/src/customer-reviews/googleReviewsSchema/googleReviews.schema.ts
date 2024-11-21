import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Residence } from '../../residences/schema/residences.schema';

@Schema({ timestamps: true })
export class GoogleReviews extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Residence' })
  residenceId: Residence;

  @Prop({ required: true, type: String, unique: true })
  placeId: string;

  @Prop({ required: true, type: String })
  reviewSummary: string;

  @Prop({ required: true, type: Number })
  rating: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const GoogleReviewsSchema = SchemaFactory.createForClass(GoogleReviews);
