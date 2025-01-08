import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";
import { ResidenceStatus } from "../enum/residence-enum";
import { joiObjectIdValidator } from "@bbr/api-core/modules/custome-validations/custome-validations";
import * as Joi from 'joi';

export class PatchResidenceDto {
    @ApiProperty({ example: 'Ritz Carlton Miami', required: false })
  name?: string;

  @ApiProperty({
    example: ['60d9c6a0a11c3c6c6a9a1a2a', '60d9c6a0a11c3c6c6a9a1b3c'],
    required: false,
    type: [String],
    description: 'Array of residence type IDs',
  })
  residenceTypeIds?: Types.ObjectId[];

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1a', required: false, type: String })
  locationId?: Types.ObjectId;


  @ApiProperty({ example: 'https://dummywebsite.com', required: false })
  websiteLink?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1b', required: false, type: String })
  associatedBrandId?: Types.ObjectId;

  @ApiProperty({
    required: false,
    example: {
      subtitle: "Luxury Living in Miami",
      briefDescription: "A stunning waterfront residence with panoramic views"
    }
  })
  briefOverview?: {
    subtitle?: string;
    briefDescription?: string;
  };

  @ApiProperty({
    required: false,
    example: {
      subtitle: "Experience Modern Luxury",
      generalDescription: "State-of-the-art amenities and designer finishes",
      community: "Vibrant waterfront community",
      recentRenovation: "Complete renovation in 2023",
      localAttractions: "Minutes from South Beach and Design District",
      futureDevelopmentPlans: "Upcoming marina expansion in 2024"
    }
  })
  comprehensiveOverview?: {
    subtitle?: string;
    generalDescription?: string;
    community?: string;
    recentRenovation?: string;
    localAttractions?: string;
    futureDevelopmentPlans?: string;
  };

  @ApiProperty({
    required: false,
    example: {
      startRange: 1000000,
      endRange: 5000000
    }
  })
  budgetLimitationsRange?: {
    startRange?: number;
    endRange?: number;
  };

  @ApiProperty({
    required: false,
    example: {
      featureIds: ['60d9c6a0a11c3c6c6a9a1a1b', '60d9c6a0a11c3c6c6a9a1a1c'],
      developmentInfo: {
        yearOfBuild: 2020,
        rentalPotential: "High yield potential",
        developmentStatus: "Completed",
        floorAreaSqFt: 2500,
        staffToResidenceRatio: 0.5
      },
      bespokeAmenitiesAmount: 40,
      avgPricePerUnit: 5000000,
      petPolicy: "petFriendly"
    }
  })
  residenceKeyFeatures?: {
    featureIds?: Types.ObjectId[];
    developmentInfo?: {
      yearOfBuild?: number;
      rentalPotential?: string;
      developmentStatus?: string;
      floorAreaSqFt?: number;
      staffToResidenceRatio?: number;
    };
    bespokeAmenitiesAmount?: number;
    avgPricePerUnit?: number;
    petPolicy?: string;
  };

  @ApiProperty({
    required: false,
    example: {
      country: "United States",
      state: "Florida",
      city: "Miami",
      userInput: "100 South Pointe Dr",
      location: {
        lat: 25.7617,
        lng: -80.1918
      },
      placeId: "ChIJdd4hrwug2YgRvCwLr-ABLAo"
    }
  })
  address?: {
    country?: string;
    state?: string;
    city?: string;
    userInput?: string;
    location?: {
      lat?: number;
      lng?: number;
    };
    placeId?: string;
  };

  @ApiProperty({
    required: false,
    enum: ResidenceStatus,
    example: ResidenceStatus.ACTIVE
  })
  status?: ResidenceStatus;

  @ApiProperty({
    required: false,
    example: {
      mainPhotos: ['60d9c6a0a11c3c6c6a9a1a1b', '60d9c6a0a11c3c6c6a9a1a1c'],
      mainGalleryPhotos: ['60d9c6a0a11c3c6c6a9a1a1d', '60d9c6a0a11c3c6c6a9a1a1e'],
      secondGalleryPhotos: ['60d9c6a0a11c3c6c6a9a1a1f', '60d9c6a0a11c3c6c6a9a1a2a'],
      videoTour: '60d9c6a0a11c3c6c6a9a1a2b',
      videoTourLink: 'https://example.com/video-tour'
    }
  })
  visuals?: {
    mainPhotos?: Types.ObjectId[];
    mainGalleryPhotos?: Types.ObjectId[];
    secondGalleryPhotos?: Types.ObjectId[];
    videoTour?: Types.ObjectId;
    videoTourLink?: string;
  };

  @ApiProperty({
    required: false,
    example: {
      amenitiesList: ['60d9c6a0a11c3c6c6a9a1a1b', '60d9c6a0a11c3c6c6a9a1a1c'],
      highlightedAmenities: [
        {
          amenityId: '60d9c6a0a11c3c6c6a9a1a1d',
          generalDescription: 'Luxury spa with ocean views',
          imageId: '60d9c6a0a11c3c6c6a9a1a1e'
        }
      ]
    }
  })
  nearbyAmenities?: {
    amenitiesList?: Types.ObjectId[];
    highlightedAmenities?: {
      amenityId: Types.ObjectId;
      generalDescription: string;
      imageId: Types.ObjectId;
    }[];
  };
}

  export const patchResidenceSchema = Joi.object({
    name: Joi.string().optional(),
    residenceTypeIds: Joi.array()
      .items(Joi.string().custom(joiObjectIdValidator('residenceTypeIds')))
      .optional(),
    locationId: Joi.string().custom(joiObjectIdValidator('locationId')).optional(),
    websiteLink: Joi.string().optional(),
    associatedBrandId: Joi.string().custom(joiObjectIdValidator('associatedBrandId')).optional(),
    briefOverview: Joi.object({
      subtitle: Joi.string().optional(),
      briefDescription: Joi.string().optional(),
    }).optional(),
    comprehensiveOverview: Joi.object({
      subtitle: Joi.string().optional(),
      generalDescription: Joi.string().optional(),
      community: Joi.string().optional(),
      recentRenovation: Joi.string().optional(),
      localAttractions: Joi.string().optional(),
      futureDevelopmentPlans: Joi.string().optional(),
    }).optional(),
    budgetLimitationsRange: Joi.object({
      startRange: Joi.number().optional(),
      endRange: Joi.number().optional(),
    }).optional(),
    residenceKeyFeatures: Joi.object({
      featureIds: Joi.array().items(Joi.string().custom(joiObjectIdValidator('featureIds'))).optional(),
      developmentInfo: Joi.object({
        yearOfBuild: Joi.number().optional(),
        rentalPotential: Joi.string().optional(),
        developmentStatus: Joi.string().optional(),
        floorAreaSqFt: Joi.number().optional(),
        staffToResidenceRatio: Joi.number().optional(),
      }).optional(),
      bespokeAmenitiesAmount: Joi.number().optional(),
      avgPricePerUnit: Joi.number().optional(),
      petPolicy: Joi.string().optional(),
    }).optional(),
    address: Joi.object({
      country: Joi.string().optional(),
      state: Joi.string().optional(),
      city: Joi.string().optional(),
      userInput: Joi.string().optional(),
      location: Joi.object({
        lat: Joi.number().optional(),
        lng: Joi.number().optional(),
      }).optional(),
      placeId: Joi.string().optional(),
    }).optional(),
    status: Joi.string().valid(...Object.values(ResidenceStatus)).optional(),
    visuals: Joi.object({
      mainPhotos: Joi.array().items(Joi.string().custom(joiObjectIdValidator('mainPhotos'))).optional(),
      mainGalleryPhotos: Joi.array().items(Joi.string().custom(joiObjectIdValidator('mainGalleryPhotos'))).optional(),
      secondGalleryPhotos: Joi.array().items(Joi.string().custom(joiObjectIdValidator('secondGalleryPhotos'))).optional(),
      videoTour: Joi.string().custom(joiObjectIdValidator('videoTour')).optional(),
      videoTourLink: Joi.string().optional()
    }).optional(),
    nearbyAmenities: Joi.object({
      amenitiesList: Joi.array()
        .items(Joi.string().custom(joiObjectIdValidator('amenitiesList')))
        .optional(),
      highlightedAmenities: Joi.array()
        .items(
          Joi.object({
            amenityId: Joi.string().custom(joiObjectIdValidator('amenityId')).optional(),
            generalDescription: Joi.string().optional(),
            imageId: Joi.string().custom(joiObjectIdValidator('imageId'))
          })
        )
        .optional()
    }).optional()
  }).min(1);
