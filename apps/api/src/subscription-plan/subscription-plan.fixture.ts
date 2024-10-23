import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { Feature } from './schema/feature.schema';
import { Plan } from './schema/plan.schema';

@Injectable()
export class SubscriptionPlanFixture extends AbstractFixture {
  public dependsOn = [
  ];

  constructor(
    @InjectModel(Feature.name) private readonly featureModel: Model<Feature>,
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
  ) {
    super();
  }
  name = SubscriptionPlanFixture.name;
  static FEATURE_1 = 'FEATURE_1';
  static PLAN_1 = 'PLAN_1';
  async load() {

    const feature1 = await this.featureModel.create({
      name: "Includes all Basic Plan features",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const plan1 = await this.planModel.create({
      name: "Free Residence Profile",
      fee: 25000,
      billingCycle: 'month',
      trialPeriod: 0,
      features: {
        id: feature1.id,
        active: true,
        order: 1,
      },
      active: true,
      createdById: '60d5f485f7c6a4b2b8e8b600',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.addReference(SubscriptionPlanFixture.FEATURE_1, feature1);
    this.addReference(SubscriptionPlanFixture.PLAN_1, plan1);
  }
}
