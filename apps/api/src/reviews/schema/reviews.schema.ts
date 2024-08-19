import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReviewRating } from '../enum/review-enum';

@Schema({ timestamps: true })
export class Review extends Document {

  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({ required: true })
  rating: ReviewRating;

  @Prop({
    type: {
      title: String,
      details: String,
    },
    _id: false,
  })
  review: {
    title: string;
    details: string;
  };

  response: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Upload' }],
    _id: false,
  })
  photos: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Boolean, default: false })
  isResponded: boolean;

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Boolean, default: false })
  isResponseEdited: boolean;

  @Prop({ type: Boolean, default: false })
  isHighlighted: boolean;

  @Prop({ type: Boolean, default: false })
  isFlagged: boolean;

  @Prop({ type: Boolean, default: false })
  isRemovalRequested: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
