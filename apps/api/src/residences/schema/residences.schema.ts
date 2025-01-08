import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Residence extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, type: [{ type: Types.ObjectId, ref: 'ResidenceType' }] })
  residenceTypeIds: Types.ObjectId[];

  @Prop({ required: false, type: Types.ObjectId, ref: 'Location' })
  locationId: Types.ObjectId;

  @Prop({ required: false, type: String })
  placeId: string;

  @Prop({ type: String, required: false })
  uniqueUrl: string;

  @Prop({ type: String, required: false })
  key: string;

  @Prop({ required: false })
  websiteLink?: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'RankingCategory' })
  highestRankingCategoryId?: string;

  @Prop({ required: false })
  highestBbrScore?: number;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Brand' })
  associatedBrandId?: Types.ObjectId;

  @Prop({
    type: {
      subtitle: String,
      briefDescription: String,
    },
    _id: false,
  })
  briefOverview: {
    subtitle: string;
    briefDescription: string;
  };

  @Prop({
    type: {
      subtitle: String,
      generalDescription: String,
      community: String,
      recentRenovation: String,
      localAttractions: String,
      futureDevelopmentPlans: String,
    },
    _id: false,
  })
  comprehensiveOverview: {
    subtitle: string;
    generalDescription: string;
    community: string;
    recentRenovation: string;
    localAttractions: string;
    futureDevelopmentPlans: string;
  };

  @Prop({
    type: {
      startRange: Number,
      endRange: Number,
    },
    _id: false,
  })
  budgetLimitationsRange: {
    startRange: number;
    endRange: number;
  };

  @Prop({
    type: {
      featureIds: [{ type: Types.ObjectId, ref: 'ResidenceFeature' }],
      developmentInfo: {
        yearOfBuild: Number,
        rentalPotential: String,
        developmentStatus: String,
        floorAreaSqFt: Number,
        staffToResidenceRatio: Number,
      },
      bespokeAmenitiesAmount: Number,
      avgPricePerUnit: Number,
      petPolicy: String, // Enum values: "petFriendly", "No pet Allowed"
      noOfUnits: Number,
      amenitiesCount: Number,
    },
    _id: false,
  })
  residenceKeyFeatures: {
    featureIds: Types.ObjectId[];
    developmentInfo: {
      yearOfBuild: number;
      rentalPotential: string;
      developmentStatus: string;
      floorAreaSqFt: number;
      staffToResidenceRatio: number;
    };
    bespokeAmenitiesAmount: number;
    avgPricePerUnit: number;
    petPolicy: string;
    noOfUnits: number;
    amenitiesCount: number;
  };

  @Prop({
    type: {
      mainPhotos: [{ required: false, type: Types.ObjectId, ref: 'Upload' }],
      mainGalleryPhotos: [{ type: Types.ObjectId, ref: 'Upload' }],
      secondGalleryPhotos: [{ type: Types.ObjectId, ref: 'Upload' }],
      videoTour: { type: Types.ObjectId, ref: 'Upload' },
      videoTourLink: String,
    },
    _id: false,
  })
  visuals: {
    mainPhotos?: Types.ObjectId[];
    mainGalleryPhotos: Types.ObjectId[];
    secondGalleryPhotos: Types.ObjectId[];
    videoTour: Types.ObjectId;
    videoTourLink: string;
  };

  @Prop({
    type: {
      amenitiesList: [{ type: Types.ObjectId, ref: 'Amenity' }],
      highlightedAmenities: [
        {
          amenityId: { type: Types.ObjectId, ref: 'Amenity' },
          generalDescription: String,
          imageId: { type: Types.ObjectId, ref: 'Upload' },
          _id: false,
        },
      ],
    },
    _id: false,
  })
  nearbyAmenities: {
    amenitiesList: Types.ObjectId[];
    highlightedAmenities: {
      amenityId: Types.ObjectId;
      generalDescription: string;
      imageId: Types.ObjectId;
    }[];
  };

  @Prop({
    type: String,
    enum: ['active', 'pending', 'draft', 'sold', 'rejected'],
    default: 'draft',
  })
  status: string;

  @Prop({
    type: String,
    example: 'Invalid Document',
  })
  rejectionReason: string;

  @Prop({
    type: String,
    example: '33r232432423',
    required: false,
  })
  paymentMethodId?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Subscription',
    required: false,
  })
  subscriptionId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Plan',
    required: false,
  })
  planId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City' })
  cityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Country' })
  countryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'State' })
  stateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LifeStyle' })
  lifeStyleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  developerId: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedById: Types.ObjectId;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  submissionDate: Date; // Date when seller submits the request and admin activates the residence

  @Prop({
    type: {
      country: { type: String, required: false },
      state: { type: String, required: false },
      city: { type: String, required: true },
      userInput: { type: String, required: true },
      location: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
      },
      placeId: { type: String, required: false },
    },
    _id: false,
  })
  address: {
    country?: string;
    state?: string;
    city: string;
    userInput: string;
    location?: {
      lat?: number;
      lng?: number;
    };
    placeId?: string;
  };

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false })
  featured: boolean;

  @Prop({ type: Boolean, default: false })
  eVerification: boolean;

  @Prop({ type: Boolean, default: false })
  onsiteVerification: boolean;

  @Prop({ type: Date, default: null })
  verifiedOn: Date;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;
}

export const ResidenceSchema = SchemaFactory.createForClass(Residence);
