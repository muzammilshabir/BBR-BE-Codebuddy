import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MatchmakingThread extends Document {
  @Prop({
    type: String,
    required: true,
  })
  sessionId: string;

  @Prop({
    type: {
      locationIds: [{ type: Types.ObjectId, ref: 'Location' }],
      amenities: [{ type: Types.ObjectId, ref: 'Amenity' }],
      brands: [{ type: Types.ObjectId, ref: 'Brand' }],
      lifestyles: [{ type: Types.ObjectId, ref: 'Lifestyle' }],
      propertyTypes: [{ type: Types.ObjectId }],
      maxPrice: { type: Number },
      minPrice: { type: Number },
      developmentStatus: [{ type: String }],
      rentalPotential: [{ type: String }],
    },
    _id: false,
    required: false,
    default: {},
  })
  preferences?: {
    locationIds?: Types.ObjectId[];
    brands?: Types.ObjectId[];
    lifestyles?: Types.ObjectId[];
    propertyTypes: Types.ObjectId[];
    maxPrice?: number;
    minPrice?: number;
    developmentStatus?: string[];
    rentalPotential?: string[];
    amenities?: Types.ObjectId[];
  };

  @Prop({
    type: Boolean,
    default: false,
  })
  userDetailsSubmitted: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const MatchmakingThreadSchema = SchemaFactory.createForClass(MatchmakingThread);
