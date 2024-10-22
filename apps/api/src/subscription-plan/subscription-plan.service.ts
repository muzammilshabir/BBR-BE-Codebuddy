import { Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { PlanRepository } from './plan.repository';
import { FeatureRepository } from './feature.repository';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Types } from 'mongoose';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly userService: UserService,
  ) {}

  async createFeature(feature: CreateFeatureDto) {
    return this.featureRepository.create(feature);
  }

  async updateFeature(featureId: string, feature: UpdateFeatureDto) {
    return this.featureRepository.update(featureId, feature);
  }

  async getFeatures() {
    return this.featureRepository.findAll({});
  }

  async getFeature(id: string) {
    return this.featureRepository.findById(id);
  }

  async createPlan(plan: CreatePlanDto) {
    const transformedPlan = {
      ...plan,
      features: plan.features.map(
        (feature) => new Types.ObjectId(feature)
      ),
    };
    return this.planRepository.create(transformedPlan);
  }

  async updatePlan(planId: string, plan: UpdatePlanDto) {
    const existingPlan = await this.planRepository.findById(planId);
    if (!existingPlan) {
      throw new Error('Plan not found');
    }
    const transformedPlan = {
      ...plan,
      features: plan.features.map(
        (feature) => new Types.ObjectId(feature)
      ),
    };
    const mergedFeatures = [
      ...existingPlan.features,
      ...transformedPlan.features,
    ];
    transformedPlan.features = [...new Set(mergedFeatures.flat())];
    return this.planRepository.update(planId, transformedPlan);
  }

  async getPlans() {
    return this.planRepository.findAll({});
  }

  async getPlan(id: string) {
    return this.planRepository.findById(id);
  }
}
