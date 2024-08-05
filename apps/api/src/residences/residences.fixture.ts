import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Residence } from '../../src/residences/schema/residences.schema';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

@Injectable()
export class ResidencesFixture extends AbstractFixture {
  public dependsOn = [
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture
  ];

  constructor(
    @InjectModel(Residence.name) private readonly residenceModel: Model<Residence>,
  ) {
    super();
  }
  static RESIDENCE1 = 'RESIDENCE1';
  async load() {
    const residenceTypeId = this.getReference(ResidenceTypeFixture.RESIDENCE_TYPE_1)._id;
    const locationId = this.getReference(LocationFixture.TAG_UAE)._id;
    const associatedBrandId = this.getReference(BrandFixture.BRAND_PRIVATE_HOMES)._id;
    const featuresId = this.getReference(ResidenceFeatureFixture.RESIDENCE_FEATURE_1)._id;
    const mainGalleryPhotosId = this.getReference(UploadFixture.UPLOAD_1)._id;
    const secondGalleryPhotosId = this.getReference(UploadFixture.UPLOAD_2)._id;
    const videoTourId = this.getReference(UploadFixture.UPLOAD_2)._id;
    const amenitiesListId = this.getReference(AmenityFixture.TAG_PRIVATE_BEACH_ACCESS)._id;

    // Create a new Residence document
    const residence1 =  await this.residenceModel.create({
      name: 'Sample Residence',
      residenceTypeId: residenceTypeId,
      locationId: locationId,
      websiteLink: 'http://example.com',
      associatedBrandId: associatedBrandId,
      briefOverview: {
        subtitle: 'Beautiful Residence',
        briefDescription: 'A luxurious residence with beautiful views.'
      },
      comprehensiveOverview: {
        subtitle: 'Luxurious Residence',
        generalDescription: 'Located in the heart of the city.',
        community: 'Upscale community.',
        recentRenovation: 'Renovated in 2022.',
        localAttractions: 'Close to parks and shopping centers.',
        futureDevelopmentPlans: 'New development projects in the vicinity.'
      },
      budgetLimitationsRange: {
        startRange: 500000,
        endRange: 1000000
      },
      residenceKeyFeatures: {
        featuresId: [featuresId],
        developmentInfo: {
          yearOfBuild: 2020,
          rentalPotential: 'High',
          developmentStatus: 'Completed',
          floorAreaSqFt: 1500
        },
        petPolicy: 'petFriendly'
      },
      visuals: {
        mainGalleryPhotos: [mainGalleryPhotosId],
        secondGalleryPhotos: [secondGalleryPhotosId],
        videoTour: videoTourId,
        videoTourLink: 'http://example.com/video'
      },
      nearbyAmenities: {
        amenitiesList: [amenitiesListId],
        highlightedAmenities: [
          {
            name: 'Private Beach Access',
            generalDescription: 'Access to a private beach.',
            imageId: amenitiesListId
          }
        ]
      },
      status: 'draft',
      unitIds: [],
      createdById: '60d5f485f7c6a4b2b8e8b601', // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
      submissionDate: new Date()
    });

    this.addReference(ResidencesFixture.RESIDENCE1, residence1);
  }
}
