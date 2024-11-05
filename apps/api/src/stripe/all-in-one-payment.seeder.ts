import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvoiceItem } from './schema/invoice-item.schema';
import { PaymentAttempt } from './schema/payment-attempt.schema';
import { PaymentMethod } from './schema/payment-method.schema';
import { Refund } from './schema/refund.schema';
import { Subscription } from './schema/subscription.schema';
import { Transaction } from './schema/transaction.schema';
import { InvoiceStatus } from './enum/invoice-status.enum';
import { PaymentAttemptStatus } from './enum/payment-attempt-status.enum';
import { RefundStatus } from './enum/refund-status.enum';
import { SubscriptionStatus } from './enum/subscription-status.enum';
import { TransactionStatus } from './enum/transaction-status.enum';
import { Interval } from './enum/interval.enum';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Invoice } from './schema/invoice.schema';
import { Feature } from 'src/subscription-plan/schema/feature.schema';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { Residence } from 'src/residences/schema/residences.schema';
import { User } from 'src/users/schema/user.schema';

declare global {
  interface Array<T> {
    random(): T;
  }
}
@Injectable()
export class AllInOnePaymentSeeder extends AbstractSeeder {
  public name = AllInOnePaymentSeeder.name;
  private readonly logger = new Logger(AllInOnePaymentSeeder.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name) private invoiceItemModel: Model<InvoiceItem>,
    @InjectModel(PaymentAttempt.name) private paymentAttemptModel: Model<PaymentAttempt>,
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethod>,
    @InjectModel(Refund.name) private refundModel: Model<Refund>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Feature.name) private featureModel: Model<Feature>,
    @InjectModel(Plan.name) private planModel: Model<Plan>,
    @InjectModel(Residence.name) private residenceModel: Model<Residence>
  ) {
    super();
  }

  async seed() {
    Array.prototype.random = function <T>(): T {
      return this[Math.floor(Math.random() * this.length)];
    };
    try {
      await this.clearAllCollections();

      const user = await this.seedUser();
      const userId = user._id.toString();
      const features = await this.seedFeatures();
      const plans = await this.seedPlans(features, userId);
      const paymentMethods = await this.seedPaymentMethods();
      const residences = await this.seedResidences(plans, paymentMethods, userId);
      const invoices = await this.seedInvoices(residences, paymentMethods, userId);
      await this.seedInvoiceItems(invoices, features, plans);
      await this.seedSubscriptions(residences, invoices, paymentMethods);
      await this.seedPaymentAttempts(invoices, paymentMethods);
      await this.seedTransactions(residences, invoices, userId);
      await this.seedRefunds(invoices);
    } catch (error) {
      console.log('Error occurred while seeding payment data:', error);
    }

    console.log('Seeding completed successfully');
  }

  private async clearAllCollections() {
    await this.userModel.deleteOne({ email: 'seller-seeded@example.com' });
    await this.residenceModel.deleteMany({ paymentMethodId: 'pm_1QEoCmRnMTFVJU93vCHvyHRo' });
    await this.invoiceModel.deleteMany({});
    await this.invoiceItemModel.deleteMany({});
    await this.paymentAttemptModel.deleteMany({});
    await this.paymentMethodModel.deleteMany({});
    await this.refundModel.deleteMany({});
    await this.subscriptionModel.deleteMany({});
    await this.transactionModel.deleteMany({});
    await this.featureModel.deleteMany({});
    await this.planModel.deleteMany({});
  }

  private async seedUser(): Promise<User> {
    console.log('Seeding user...');
    const userData = {
      fullName: 'Seller User Test',
      email: 'seller-seeded@example.com',
      password:
        '$argon2id$v=19$m=65536,t=3,p=4$QiRS4qSqhpbgc5q4uhYXUg$NJlHEywrmqZynmGryrKyIKboIeGr+nKpfRrRGxMJIMc',
      isVerified: true,
      signupMethod: 'EMAIL',
      role: 'SELLER',
      verificationToken: null,
      oAuthId: null,
      emailVerificationToken: null,
      resetPasswordToken: null,
      emailVerified: true,
      stripeCustomerId: 'cus_R5Urqst0pMyn0w',
    };
    return await this.userModel.create(userData);
  }

  private async seedFeatures(): Promise<Feature[]> {
    console.log('Seeding features...');
    const featureData = [
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
    return await this.featureModel.create(featureData);
  }

  private async seedPlans(features: Feature[], userId: string): Promise<Plan[]> {
    console.log('Seeding plans...');
    const planFeatures = features.map((feature, index) => ({
      feature: feature._id,
      active: true,
      order: index + 1,
    }));
    const planData = [
      {
        name: 'Free Residence Profile',
        fee: 25000,
        billingCycle: 'month',
        trialPeriod: 0,
        features: planFeatures,
        active: true,
        createdById: new Types.ObjectId(userId),
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
        createdById: new Types.ObjectId(userId),
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
        createdById: new Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Features Residences',
        fee: 25000,
        billingCycle: 'month',
        trialPeriod: 0,
        features: planFeatures,
        active: true,
        createdById: new Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'BBR Verification',
        fee: 25000,
        billingCycle: 'month',
        trialPeriod: 0,
        features: planFeatures,
        active: true,
        createdById: new Types.ObjectId(userId),
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
        createdById: new Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    return await this.planModel.create(planData);
  }

  private async seedPaymentMethods(): Promise<PaymentMethod[]> {
    console.log('Seeding payment methods...');
    const paymentMethodData = [
      {
        customerId: 'cus_R5Urqst0pMyn0w',
        paymentMethodId: 'pm_1QHaPuRnMTFVJU93PoL6o2g3',
        mandateId: 'null',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
      {
        customerId: 'cus_R5Urqst0pMyn0w',
        paymentMethodId: 'pm_1QEoDmRnMTFVJU93hBRTKCpa',
        mandateId: 'null',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
      {
        customerId: 'cus_R5Urqst0pMyn0w',
        paymentMethodId: 'pm_1QEoCmRnMTFVJU93vCHvyHRo',
        mandateId: 'null',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
      {
        customerId: 'cus_R5Urqst0pMyn0w',
        paymentMethodId: 'pm_1QDJsmRnMTFVJU93KMBowPMc',
        mandateId: 'null',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      },
    ];
    return await this.paymentMethodModel.create(paymentMethodData);
  }

  private async seedResidences(
    plans: Plan[],
    paymentMethods: PaymentMethod[],
    userId: string
  ): Promise<Residence[]> {
    console.log('Seeding residences...');
    const residenceData = [
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
        planId: plans.random()._id,
        paymentMethodId: paymentMethods[0].paymentMethodId,
        unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b5ff')],
        createdById: new Types.ObjectId(userId),
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
        planId: plans.random()._id,
        paymentMethodId: paymentMethods[0].paymentMethodId,
        unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b609')],
        createdById: new Types.ObjectId(userId),
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
        planId: plans.random()._id,
        paymentMethodId: paymentMethods[0].paymentMethodId,
        unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b613')],
        createdById: new Types.ObjectId(userId),
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
          briefDescription: "A cozy yet opulent lodge nestled in the heart of Aspen's ski country",
        },
        comprehensiveOverview: {
          subtitle: 'Luxurious mountain retreat',
          generalDescription:
            "A cozy yet opulent lodge nestled in the heart of Aspen's ski country",
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
        planId: plans.random()._id,
        paymentMethodId: paymentMethods[0].paymentMethodId,
        unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b61e')],
        createdById: new Types.ObjectId(userId),
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
          briefDescription: "A modern loft apartment offering panoramic views of Chicago's skyline",
        },
        comprehensiveOverview: {
          subtitle: 'Urban sophistication with breathtaking views',
          generalDescription:
            "A modern loft apartment offering panoramic views of Chicago's skyline",
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
        planId: plans.random()._id,
        paymentMethodId: paymentMethods[0].paymentMethodId,
        unitIds: [new Types.ObjectId('60d5f485f7c6a4b2b8e8b629')],
        createdById: new Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
        submissionDate: new Date(),
      },
    ];
    return await this.residenceModel.create(residenceData);
  }

  private async seedInvoices(
    residences: Residence[],
    paymentMethods: PaymentMethod[],
    userId: string
  ): Promise<Invoice[]> {
    console.log('Seeding invoices...');
    const invoiceData = residences.map((residence, index) => ({
      residenceId: residence._id,
      membershipType: `Membership ${index + 1}`,
      paymentMethodId: paymentMethods[0].paymentMethodId,
      discount: 500,
      tax: 5,
      subTotal: 10000,
      note: 'Test invoice',
      status: InvoiceStatus.PENDING,
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      developerId: new Types.ObjectId(userId),
    }));

    const invoices = [];
    for (const invoice of invoiceData) {
      invoices.push(await this.invoiceModel.create(invoice));
    }
    return invoices;
  }

  private async seedInvoiceItems(
    invoices: Invoice[],
    features: Feature[],
    plans: Plan[]
  ): Promise<InvoiceItem[]> {
    console.log('Seeding invoiceItems...');
    const invoiceItemData = invoices.flatMap((invoice, index) => [
      {
        invoiceId: invoice._id,
        stripeProductId: `prod_R9rcs6Saybk5RH`,
        feature: features[0]._id,
        quantity: 1,
      },
      {
        invoiceId: invoice._id,
        stripeProductId: `prod_R9rcdV27cHUK07`,
        plan: plans[index]._id,
        quantity: 1,
      },
    ]);
    return await this.invoiceItemModel.create(invoiceItemData);
  }

  private async seedSubscriptions(
    residences: Residence[],
    invoices: Invoice[],
    paymentMethods: PaymentMethod[]
  ): Promise<Subscription> {
    console.log('Seeding subscription...');
    const subscriptionData = {
      residenceId: residences[0]._id,
      baseInvoiceId: invoices[0]._id,
      recurring: {
        interval: Interval.MONTH,
        interval_count: 1,
      },
      paymentMethodId: paymentMethods[0].paymentMethodId,
      reminderDays: 7,
      renewalAttempts: 3,
      attemptsFrequency: 1,
      gracePeriod: 7,
      status: SubscriptionStatus.ACTIVE,
    };
    return await this.subscriptionModel.create(subscriptionData);
  }

  private async seedPaymentAttempts(
    invoices: Invoice[],
    paymentMethods: PaymentMethod[]
  ): Promise<PaymentAttempt[]> {
    const paymentAttemptData = invoices.map((invoice, index) => ({
      invoiceId: invoice._id,
      attemptNumber: 1,
      attemptsRemaining: 2,
      attemptsRemainingToday: 1,
      paymentMethodId: paymentMethods[0].paymentMethodId,
      stripeInvoiceId: `si_${index}`,
      status: PaymentAttemptStatus.PENDING,
    }));
    return await this.paymentAttemptModel.create(paymentAttemptData);
  }

  private async seedTransactions(
    residences: Residence[],
    invoices: Invoice[],
    userId: string
  ): Promise<Transaction[]> {
    console.log('Seeding transactions...');
    const transactionData = invoices.map((invoice, index) => ({
      invoiceId: invoice._id,
      developerId: new Types.ObjectId(userId),
      residenceId: residences[index]._id,
      amount: 10000,
      status: TransactionStatus.PAID,
    }));
    return await this.transactionModel.create(transactionData);
  }

  private async seedRefunds(invoices: Invoice[]): Promise<Refund[]> {
    console.log('Seeding refunds...');
    const statuses = Object.values(RefundStatus);
    const reasons = [
      'Customer dissatisfaction',
      'Product defect',
      'Incorrect charge',
      'Service not provided',
      'Duplicate charge',
    ];
    const notes = [
      'Processed as requested',
      'Partial refund issued',
      'Full refund provided',
      'Refund denied',
      'Escalated to management',
    ];

    const refundData = invoices.map((invoice) => ({
      invoiceId: invoice._id,
      amount: Math.floor(Math.random() * 99000 + 1000) / 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      note: notes[Math.floor(Math.random() * notes.length)],
      attachments: [new Types.ObjectId(), new Types.ObjectId()],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    }));
    return await this.refundModel.create(refundData);
  }
}
