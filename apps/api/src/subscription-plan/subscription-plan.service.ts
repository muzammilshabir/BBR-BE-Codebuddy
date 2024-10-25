import { Injectable } from '@nestjs/common';
import { PlanRepository } from './plan.repository';
import { FeatureRepository } from './feature.repository';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Types } from 'mongoose';
import { ListPropsDto } from '@bbr/api-core/modules/dto/listProps.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { SubscriptionRepository } from 'src/stripe/subscription.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
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
      features: plan.features.map((feature) => {
        feature.feature = new Types.ObjectId(feature.feature);
        return feature;
      }),
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
    };
    if("features" in plan && plan.features.length > 0) {
      const newFeatures = plan.features.map((feature) => {
        feature.feature = new Types.ObjectId(feature.feature);
        return feature;
      });
      const mergedFeatures = [...existingPlan.features, ...newFeatures];
      transformedPlan.features = [...new Set(mergedFeatures.flat())];
    }

    return this.planRepository.update(planId, transformedPlan);
  }

  async getPlans() {
    return this.planRepository.findAllExpanded({
      active: true,
      isDeleted: false,
    });
  }

  async getPlansAdmin() {
    const plans = await this.planRepository.findAllExpanded({});
    const residenceCounts = await this.residenceRepository.aggregate([
      { $match: { planId: { $ne: null } } },
      { $group: { _id: '$planId', residenceCount: { $sum: 1 } } }
    ]);
    const residenceCountMap = new Map(
      residenceCounts.map(item => [item._id.toString(), item.residenceCount])
    );
    for (const plan of plans) {
      plan.residenceCount = residenceCountMap.get(plan._id.toString()) || 0;
    }
    return plans;
  }

  async getPlan(id: string) {
    return this.planRepository.findByIdExpanded(id);
  }

  async getPlanResidences(id: string, listResidencesDto: ListPropsDto) {
    const options = PaginationService.prepareOptions(listResidencesDto);
    const { data, count } = await this.residenceRepository.findAll({ planId: id }, options);

    const { pagination } = PaginationService.paginate({ rows: data, count: count }, listResidencesDto);

    return { pagination, residences: data };
  }
}
