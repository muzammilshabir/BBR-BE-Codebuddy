import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Residence } from 'src/residences/schema/residences.schema';
import { Upload } from 'src/upload/schema/upload.schema';
import { User } from '../../users/schema/user.schema';

@Schema({ timestamps: true })
export class CustomerReview extends Document {
  @Prop({ type: String, required: true })
  displayId?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residence: Residence;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  developer: User;

  @Prop({ required: true, type: String })
  fullName: string;

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({
    required: false,
    type: String,
  })
  review: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Upload' }],
    _id: false,
  })
  photos: Upload[];

  @Prop({ required: true, type: Number, min: 1, max: 10 })
  overallRating: number;

  @Prop({ type: Date, required: true })
  dateOfPurchase: Date;

  @Prop({
    required: true,
    type: {
      location: { type: Number, min: 1, max: 5, required: true },
      amenities: { type: Number, min: 1, max: 5, required: true },
      serviceQuality: { type: Number, min: 1, max: 5, required: true },
      designArchitecture: { type: Number, min: 1, max: 5, required: true },
      livingExperience: { type: Number, min: 1, max: 5, required: true },
      value: { type: Number, min: 1, max: 5, required: true },
    },
    _id: false,
  })
  ratings: {
    location: number;
    amenities: number;
    serviceQuality: number;
    designArchitecture: number;
    livingExperience: number;
    value: number;
  };

  @Prop({ required: true, type: Boolean, default: false })
  isVerifiedBuyer: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CustomerReviewSchema = SchemaFactory.createForClass(CustomerReview);
