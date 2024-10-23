import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';
import { FeatureRepository } from './feature.repository';
import { PlanRepository } from './plan.repository';

@Injectable()
export class SubscriptionPlanSeeder extends AbstractSeeder {
  public name = SubscriptionPlanSeeder.name;
  private readonly logger = new Logger(SubscriptionPlanSeeder.name);

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly planRepository: PlanRepository,
  ) {
    super();
  }

  async seed() {
    try {
      const features = [
        {
          name: "Includes all Basic Plan features",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Showcase your brand with enhanced property listings",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Access leads from buyers who inquire through our platform",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Boost traffic with advanced SEO and performance analytics",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Easily upload inventory for visitors to view and inquire about",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Highlight units with exclusive BBR offers for our visitors",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Get AI-driven insights to improve performance and lead generation",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Receive expert support from a dedicated marketing consultant",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const planFeatures = [];
      let order = 1;
      for (const feature of features) {
        const created = await this.featureRepository.create(feature);
        planFeatures.push({
          id: created.id,
          active: true,
          order,
        });
        order++;
      }
      const plans = [
        {
          name: "Free Residence Profile",
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
          name: "Premium Residence Profile",
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
          name: "Bespoke Residence Profile",
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
          name: "Features Residences",
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
          name: "BBR Verification",
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
          name: "Inactive plan example",
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
      for (const plan of plans) {
        await this.planRepository.create(plan);
      }
    } catch (error) {
      this.logger.error('Error seeding plans and features', error);
    }
  }
}