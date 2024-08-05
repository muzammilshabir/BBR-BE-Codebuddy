import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Residence extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  residenceTypeId: string;

  @Prop({ required: true })
  locationId: string;

  @Prop({ required: true })
  websiteLink: string;

  @Prop({ required: true })
  associatedBrandId: string;

  @Prop({
    type: {
      subtitle: String,
      briefDescription: String,
    },
    _id: false
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
    _id: false
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
    _id: false
  })
  budgetLimitationsRange: {
    startRange: number;
    endRange: number;
  };

  @Prop({
    type: {
      featuresId: [String], // 
      developmentInfo: {
        yearOfBuild: Number,
        rentalPotential: String, // Consider using an enum for better validation
        developmentStatus: String, // Consider using an enum for better validation
        floorAreaSqFt: Number
      },
      petPolicy: String // Enum values: "petFriendly", "No pet Allowed"
    },
    _id: false
  })
  residenceKeyFeatures: {
    featuresId: string[];
    developmentInfo: {
      yearOfBuild: number;
      rentalPotential: string; // Consider using an enum for better validation
      developmentStatus: string; // Consider using an enum for better validation
      floorAreaSqFt: number;
    };
    petPolicy: string; // Enum values: "petFriendly", "No pet Allowed"
  };

  @Prop({
    type: {
      mainGalleryPhotos: [String], 
      secondGalleryPhotos: [String], 
      videoTour: String // ObjectId reference or URL
    },
    _id: false
  })
  visuals: {
    mainGalleryPhotos: string[];
    secondGalleryPhotos: string[];
    videoTour: string;
    videoTourLink:string;
  };

  @Prop({
    type: {
      amenitiesList: [String], 
      highlightedAmenities: [
        {
          name: String,
          generalDescription: String,
          imageId: String 
        }
      ]
    },
    _id: false
  })
  nearbyAmenities: {
    amenitiesList: string[];
    highlightedAmenities: {
      name: string;
      generalDescription: string;
      imageId: string; 
    }[];
  };

  @Prop({
    type: String,
    enum: ['active', 'pending', 'draft', 'sold', 'rejected'],
    default: 'draft'
  })
  status: string;

  @Prop([String]) 
  unitIds: string[];

  @Prop({ type: String }) 
  createdById: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  submissionDate: Date; // Date when seller submits the request and admin activates the residence
}

export const ResidenceSchema = SchemaFactory.createForClass(Residence);