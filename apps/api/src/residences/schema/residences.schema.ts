import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Residence extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ResidenceType' })
  residenceTypeId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Location' })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  websiteLink: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Brand' })
  associatedBrandId: Types.ObjectId;

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
      },
      petPolicy: String, // Enum values: "petFriendly", "No pet Allowed"
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
    };
    petPolicy: string;
  };

  @Prop({
    type: {
      mainGalleryPhotos: [{ type: Types.ObjectId, ref: 'Upload' }],
      secondGalleryPhotos: [{ type: Types.ObjectId, ref: 'Upload' }],
      videoTour: { type: Types.ObjectId, ref: 'Upload' },
      videoTourLink: String,
    },
    _id: false,
  })
  visuals: {
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
          amenitieId: { type: Types.ObjectId, ref: 'Amenity' },
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
      amenitieId: Types.ObjectId;
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

  @Prop([{ type: Types.ObjectId, ref: 'Unit' }]) // add unit collection ref
  unitIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  submissionDate: Date; // Date when seller submits the request and admin activates the residence
}

export const ResidenceSchema = SchemaFactory.createForClass(Residence);
