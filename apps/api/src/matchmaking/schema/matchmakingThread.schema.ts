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
      countryId: [{ type: Types.ObjectId, ref: 'Country' }],
      cities: [{ type: Types.ObjectId, ref: 'City' }],
      geographicalAreasId: [{ type: Types.ObjectId }],
      propertyTypes: [{ type: Types.ObjectId }],
      lifestyles: [{ type: Types.ObjectId, ref: 'Lifestyle' }],
      brands: [{ type: Types.ObjectId, ref: 'Brand' }],
      petPolicy: [{ type: String }],
      floorAreaSqFt: [{ type: Number }],
      featureIds: [{ type: Types.ObjectId, ref: 'ResidenceFeature' }],
      yearOfBuild: [{ type: Number }],
      rentalPotential: [{ type: String }],
      developmentStatus: [{ type: String }],
      amenitiesList: [{ type: Types.ObjectId, ref: 'Amenity' }],
      priceRange: [{
        startRange: { type: Number },
        endRange: { type: Number }
      }],
      roomCountRange: [{
        minRooms: { type: Number },
        maxRooms: { type: Number }
      }]
    },
    _id: false,
    required: false,
    default: {},
  })
  preferences?: {
    countryId?: Types.ObjectId[];
    cities?: Types.ObjectId[];
    geographicalAreasId: Types.ObjectId[];
    propertyTypes?: Types.ObjectId[];
    lifestyles?: Types.ObjectId[];
    brands?: Types.ObjectId[];
    petPolicy?: string[];
    floorAreaSqFt?: number[];
    featureIds?: Types.ObjectId[];
    yearOfBuild?: number[],
    rentalPotential?: string[];
    developmentStatus?: string[];
    amenitiesList?: Types.ObjectId[];
    priceRange?: { startRange: number; endRange: number }[];
    roomCountRange?: { minRooms: number; maxRooms: number }[];
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
