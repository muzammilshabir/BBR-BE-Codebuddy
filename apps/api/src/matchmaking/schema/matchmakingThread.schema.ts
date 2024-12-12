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
      propertyTypes: [{ type: Types.ObjectId }],
      lifestyles: [{ type: Types.ObjectId, ref: 'Lifestyle' }],
      brands: [{ type: Types.ObjectId, ref: 'Brand' }],
      petFriendly: [{ type: String }],
      floorArea: [{ type: Number }],
      featureIds: [{ type: Types.ObjectId, ref: 'ResidenceFeature' }],
      yearBuild: [{ type: Number }],
      rentalPotential: [{ type: String }],
      developmentStatus: [{ type: String }],
      amenities: [{ type: Types.ObjectId, ref: 'Amenity' }],
      priceRange: [{
        start: { type: Number },
        end: { type: Number }
      }],
    },
    _id: false,
    required: false,
    default: {},
  })
  preferences?: {
    locationIds?: Types.ObjectId[];
    propertyTypes?: Types.ObjectId[];
    lifestyles?: Types.ObjectId[];
    brands?: Types.ObjectId[];
    petFriendly?: string[];
    floorArea?: number[];
    featureIds?: Types.ObjectId[];
    yearBuild?: number[];
    rentalPotential?: string[];
    developmentStatus?: string[];
    amenities?: Types.ObjectId[];
    priceRange?: { start: number; end: number }[];
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
