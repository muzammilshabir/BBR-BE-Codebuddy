import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';
import { FeatureRepository } from './feature.repository';
import { PlanRepository } from './plan.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
declare global {
  interface Array<T> {
    random(): T;
  }
}
@Injectable()
export class SubscriptionPlanSeeder extends AbstractSeeder {
  public name = SubscriptionPlanSeeder.name;
  private readonly logger = new Logger(SubscriptionPlanSeeder.name);

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly planRepository: PlanRepository,
    private readonly residenceRepository: ResidenceRepository,
  ) {
    super();
  }

  async seed() {
    try {
      
      Array.prototype.random = function<T>(): T {
        return this[Math.floor(Math.random() * this.length)];
      };
      const features = [
        {
          name: 'Includes all Basic Plan features',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Showcase your brand with enhanced property listings',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Access leads from buyers who inquire through our platform',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Boost traffic with advanced SEO and performance analytics',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Easily upload inventory for visitors to view and inquire about',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Highlight units with exclusive BBR offers for our visitors',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Get AI-driven insights to improve performance and lead generation',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Receive expert support from a dedicated marketing consultant',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const planFeatures = [];
      let order = 1;
      for (const feature of features) {
        const created = await this.featureRepository.upsert({ name: feature.name }, feature);
        planFeatures.push({
          feature: created.id,
          active: true,
          order,
        });
        order++;
      }
      const plans = [
        {
          name: 'Free Residence Profile',
          fee: 25000,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Premium Residence Profile',
          fee: 25000,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Bespoke Residence Profile',
          fee: 25000,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Features Residences',
          fee: 800,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Features Residences weekly',
          fee: 250,
          billingCycle: 'week',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Onsite Verification',
          fee: 25000,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'E-Verification',
          fee: 99,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: true,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Inactive plan example',
          fee: 25000,
          billingCycle: 'month',
          trialPeriod: 0,
          features: planFeatures,
          active: false,
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const dbPlans = [];
      for (const plan of plans) {
        dbPlans.push(await this.planRepository.upsert({ name: plan.name }, plan));
      }

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
          planId: dbPlans.random()._id,
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
          planId: dbPlans.random()._id,
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
          planId: dbPlans.random()._id,
          paymentMethodId: 'r23r23r32rwewe',
          unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b613')],
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b614'),
          createdAt: new Date(),
          updatedAt: new Date(),
          submissionDate: new Date(),
        },
        {
          name: 'Mountain Lodge Aspen',
          residenceTypeId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b615'),
          locationId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b616'),
          websiteLink: 'https://example.com/mountain-lodge-aspen',
          associatedBrandId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b617'),
          briefOverview: {
            subtitle: 'Luxurious mountain retreat',
            briefDescription: 'A cozy yet opulent lodge nestled in the heart of Aspen\'s ski country',
          },
          comprehensiveOverview: {
            subtitle: 'Luxurious mountain retreat',
            generalDescription: 'A cozy yet opulent lodge nestled in the heart of Aspen\'s ski country',
            community: 'Exclusive gated community with access to private ski slopes',
            recentRenovation: 'Recently added a state-of-the-art home theater and wine cellar',
            localAttractions: 'World-class ski resorts and hiking trails at your doorstep',
            futureDevelopmentPlans: 'Upcoming addition of a private helipad for easy access',
          },
          budgetLimitationsRange: {
            startRange: 50000,
            endRange: 800000,
          },
          residenceKeyFeatures: {
            featureIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b618')],
            developmentInfo: {
              yearOfBuild: 2018,
              rentalPotential: 'High Rental Yield',
              developmentStatus: 'Completed',
              floorAreaSqFt: 80000,
            },
            petPolicy: 'petFriendly',
          },
          visuals: {
            mainGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b619')],
            secondGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b61a')],
            videoTour: new Types.ObjectId('60d5f485f7c6a4b2b8e8b61b'),
            videoTourLink: 'https://example.com/video-tour-mountain-lodge',
          },
          nearbyAmenities: {
            amenitiesList: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b61c')],
            highlightedAmenities: [
              {
                amenityId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b61c'),
                generalDescription: 'Private ski-in/ski-out access to exclusive slopes',
                imageId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b61d'),
              },
            ],
          },
          status: 'active',
          subscriptionId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          planId: dbPlans.random()._id,
          paymentMethodId: 'r23r23r32rwewe',
          unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b61e')],
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b61f'),
          createdAt: new Date(),
          updatedAt: new Date(),
          submissionDate: new Date(),
        },
        {
          name: 'Skyline Loft Chicago',
          residenceTypeId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b620'),
          locationId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b621'),
          websiteLink: 'https://example.com/skyline-loft-chicago',
          associatedBrandId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b622'),
          briefOverview: {
            subtitle: 'Urban sophistication with breathtaking views',
            briefDescription: 'A modern loft apartment offering panoramic views of Chicago\'s skyline',
          },
          comprehensiveOverview: {
            subtitle: 'Urban sophistication with breathtaking views',
            generalDescription: 'A modern loft apartment offering panoramic views of Chicago\'s skyline',
            community: 'Vibrant downtown neighborhood with a mix of professionals and artists',
            recentRenovation: 'Recently upgraded with smart home technology throughout',
            localAttractions: 'Walking distance to Millennium Park and the Art Institute of Chicago',
            futureDevelopmentPlans: 'Plans for a rooftop garden and co-working space',
          },
          budgetLimitationsRange: {
            startRange: 15000,
            endRange: 250000,
          },
          residenceKeyFeatures: {
            featureIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b623')],
            developmentInfo: {
              yearOfBuild: 2016,
              rentalPotential: 'Moderate Rental Yield',
              developmentStatus: 'Completed',
              floorAreaSqFt: 35000,
            },
            petPolicy: 'No pet Allowed',
          },
          visuals: {
            mainGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b624')],
            secondGalleryPhotos: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b625')],
            videoTour: new Types.ObjectId('60d5f485f7c6a4b2b8e8b626'),
            videoTourLink: 'https://example.com/video-tour-skyline-loft',
          },
          nearbyAmenities: {
            amenitiesList: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b627')],
            highlightedAmenities: [
              {
                amenityId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b627'),
                generalDescription: 'State-of-the-art fitness center with personal trainers',
                imageId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b628'),
              },
            ],
          },
          status: 'draft',
          subscriptionId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          planId: dbPlans.random()._id,
          paymentMethodId: 'r23r23r32rwewe',
          unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b629')],
          createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b62a'),
          createdAt: new Date(),
          updatedAt: new Date(),
          submissionDate: new Date(),
        },
      ];

      for (const residence of residences) {
        await this.residenceRepository.upsert({ name: residence.name }, residence);
      }
    } catch (error) {
      this.logger.error('Error seeding plans and features', error);
    }
  }
}
