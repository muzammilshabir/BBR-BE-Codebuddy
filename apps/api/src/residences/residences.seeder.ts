import { Injectable, Logger } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';

@Injectable()
export class ResidenceSeeder extends AbstractSeeder {
  public name = ResidenceSeeder.name;
  private readonly logger = new Logger(ResidenceSeeder.name);

  constructor(private readonly residenceRepository: ResidenceRepository) {
    super();
  }

  async seed() {
    try {
      const residences = [
        {
          name: 'Ritz Carlton Miami',
          residenceTypeId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b68b'),
          locationId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5f7'),
          websiteLink: 'https://example.com/ritz-carlton-miami',
          associatedBrandId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5f8'),
          briefOverview: {
            subtitle:
              'An idyllic coastal destination that combines natural beauty & iconic architecture',
            briefDescription:
              'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
          },
          comprehensiveOverview: {
            subtitle:
              'An idyllic coastal destination that combines natural beauty & iconic architecture',
            generalDescription:
              'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
            community: 'Fine dining, park, and excellent schools just minutes away',
            recentRenovation: 'Enjoy modern upgrades with a newly remodeled kitchen',
            localAttractions: 'Located in an upscale area with boutique shops',
            futureDevelopmentPlans: 'Exciting enhancements include a new community center',
          },
          budgetLimitationsRange: {
            startRange: 10000,
            endRange: 200000,
          },
          residenceKeyFeatures: {
            featureIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5f9')],
            developmentInfo: {
              yearOfBuild: 2010,
              rentalPotential: 'High Rental Yield',
              developmentStatus: 'Under Construction',
              floorAreaSqFt: 50000,
            },
            petPolicy: 'petFriendly',
          },
          visuals: {
            mainGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fa')],
            secondGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fb')],
            videoTour: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fc'),
            videoTourLink: 'https://example.com/video-tour',
          },
          nearbyAmenities: {
            amenitiesList: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fd')],
            highlightedAmenities: [
              {
                amenityId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fd'),
                generalDescription:
                  'The remarkable structure features a single, 15-story tower, boasting a total of 30 exclusive units',
                imageId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fe'),
              },
            ],
          },
          status: 'draft',
          subscriptionId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          paymentMethodId: 'r23r23r32rwewe',
          unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5ff')],
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
          submissionDate: new Date(),
        },
        {
          name: 'Penthouse New York',
          residenceTypeId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b69b'),
          locationId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b601'),
          websiteLink: 'https://example.com/penthouse-ny',
          associatedBrandId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b602'),
          briefOverview: {
            subtitle: 'A luxurious urban residence',
            briefDescription:
              'Located at the heart of New York, this penthouse offers stunning city views',
          },
          comprehensiveOverview: {
            subtitle: 'A luxurious urban residence',
            generalDescription:
              'Located at the heart of New York, this penthouse offers stunning city views',
            community: 'Close to theaters, shopping districts, and renowned restaurants',
            recentRenovation: 'Newly refurbished with state-of-the-art amenities',
            localAttractions: 'Walking distance to Central Park and Times Square',
            futureDevelopmentPlans: 'Upcoming rooftop garden and lounge area',
          },
          budgetLimitationsRange: {
            startRange: 20000,
            endRange: 300000,
          },
          residenceKeyFeatures: {
            featureIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b603')],
            developmentInfo: {
              yearOfBuild: 2015,
              rentalPotential: 'Moderate Rental Yield',
              developmentStatus: 'Completed',
              floorAreaSqFt: 40000,
            },
            petPolicy: 'No pet Allowed',
          },
          visuals: {
            mainGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b604')],
            secondGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b605')],
            videoTour: new Types.ObjectId('60d5f485f7c6a4b2b8e8b606'),
            videoTourLink: 'https://example.com/video-tour-penthouse-ny',
          },
          nearbyAmenities: {
            amenitiesList: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b607')],
            highlightedAmenities: [
              {
                amenityId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fd'),
                generalDescription: 'Convenient and secure valet parking service',
                imageId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b608'),
              },
            ],
          },
          status: 'active',
          subscriptionId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          paymentMethodId: 'r23r23r32rwewe',
          unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b609')],
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b60a'),
          createdAt: new Date(),
          updatedAt: new Date(),
          submissionDate: new Date(),
        },
        {
          name: 'Beach Villa Malibu',
          residenceTypeId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b67b'),
          locationId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b60b'),
          websiteLink: 'https://example.com/beach-villa-malibu',
          associatedBrandId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b60c'),
          briefOverview: {
            subtitle: 'Exclusive beachfront living',
            briefDescription: 'A stunning beachfront villa with private access to the beach',
          },
          comprehensiveOverview: {
            subtitle: 'Exclusive beachfront living',
            generalDescription: 'A stunning beachfront villa with private access to the beach',
            community: 'Private, secure, and serene environment',
            recentRenovation: 'Newly installed solar panels and energy-efficient systems',
            localAttractions: 'Proximity to celebrity homes and luxury resorts',
            futureDevelopmentPlans: 'Plans for an infinity pool and spa area',
          },
          budgetLimitationsRange: {
            startRange: 30000,
            endRange: 500000,
          },
          residenceKeyFeatures: {
            featureIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b60d')],
            developmentInfo: {
              yearOfBuild: 2020,
              rentalPotential: 'Low Rental Yield',
              developmentStatus: 'In Planning',
              floorAreaSqFt: 60000,
            },
            petPolicy: 'petFriendly',
          },
          visuals: {
            mainGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b60e')],
            secondGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b60f')],
            videoTour: new Types.ObjectId('60d5f485f7c6a4b2b8e8b610'),
            videoTourLink: 'https://example.com/video-tour-beach-villa',
          },
          nearbyAmenities: {
            amenitiesList: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b611')],
            highlightedAmenities: [
              {
                amenityId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b611'),
                generalDescription: 'Direct access to a private beach',
                imageId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b612'),
              },
            ],
          },
          status: 'draft',
          subscriptionId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          paymentMethodId: 'r23r23r32rwewe',
          unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b613')],
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b614'),
          createdAt: new Date(),
          updatedAt: new Date(),
          submissionDate: new Date(),
        },
      ];

      for (const residence of residences) {
        await this.residenceRepository.upsert({ name: residence.name }, residence);
      }
    } catch (error) {
      this.logger.error('Error seeding residences', error);
    }
  }
}
