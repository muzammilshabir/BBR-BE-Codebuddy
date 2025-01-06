import { Injectable } from '@nestjs/common';
import { PlanRepository } from './plan.repository';
import { FeatureRepository } from './feature.repository';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { RootFilterQuery, Types } from 'mongoose';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { SubscriptionRepository } from 'src/stripe/subscription.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { ListPlanResidencesDto } from './dto/list-plan-residences.dto';
import { ListPlansDto, PlanForPage } from './dto/list-plan.dto';
import { Plan } from './schema/plan.schema';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly subscriptionRepository: SubscriptionRepository
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

    const transformedPlan = { ...plan };

    if ('features' in plan && plan.features.length > 0) {
      const updatedFeatures = existingPlan.features.slice();

      for (const newFeature of plan.features) {
        const featureId = new Types.ObjectId(newFeature.feature);
        const existingFeatureIndex = updatedFeatures.findIndex(
          (f) => f.feature.toString() === featureId.toString()
        );
        if (existingFeatureIndex !== -1) {
          updatedFeatures[existingFeatureIndex].feature = featureId;
          updatedFeatures[existingFeatureIndex].active = newFeature.active;
          updatedFeatures[existingFeatureIndex].order = newFeature.order;
        } else {
          updatedFeatures.push({
            ...newFeature,
            feature: featureId,
          });
        }
      }
      transformedPlan.features = updatedFeatures;
    }

    return this.planRepository.update(planId, transformedPlan);
  }

  async getPlans(query: ListPlansDto) {
    const options: RootFilterQuery<Plan> = {
      active: true,
      isDeleted: false,
    };
    if (
      query.forPage === PlanForPage.GUEST_UPLOAD_INVENTORY ||
      query.forPage === PlanForPage.CREATE_INVOICE_SCHEDULE
    ) {
      options.name = {
        $in: ['Premium Residence Profile', 'Bespoke Residence Profile'],
      };
    }
    if (query.forPage === PlanForPage.REQUEST_PREMIUM_RESIDENCE_PROFILE) {
      options.name = {
        $in: ['Premium Residence Profile'],
      };
    }
    if (query.forPage === PlanForPage.REQUEST_BBR_VERIFICATION) {
      options.name = {
        $in: ['Onsite Verification', 'E-Verification'],
      };
    }
    if (query.forPage === PlanForPage.REQUEST_FEATURES_RESIDENCES) {
      options.name = {
        $in: ['Features Residences', 'Features Residences weekly'],
      };
    }

    return this.planRepository.findAllExpanded(options);
  }

  async getPlansAdmin() {
    const plans = await this.planRepository.findAllExpanded({});
    const residenceCounts = await this.residenceRepository.aggregate([
      { $match: { planId: { $ne: null } } },
      { $group: { _id: '$planId', residenceCount: { $sum: 1 } } },
    ]);
    const residenceCountMap = new Map(
      residenceCounts.map((item) => [item._id.toString(), item.residenceCount])
    );
    for (const plan of plans) {
      plan.residenceCount = residenceCountMap.get(plan._id.toString()) || 0;
    }
    return plans;
  }

  async getPlan(id: string) {
    return this.planRepository.findByIdExpanded(id);
  }

  async getPlanResidences(id: string, listResidencesDto: ListPlanResidencesDto) {
    const { status, search } = listResidencesDto;
    const query: any = {
      planId: new Types.ObjectId(id),
      isDeleted: false,
    };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }];
    }
    const options = PaginationService.prepareOptions(listResidencesDto);
    const { data, count } = await this.residenceRepository.findAll(query, options);

    const { pagination } = PaginationService.paginate(
      { rows: data, count: count },
      listResidencesDto
    );

    return { pagination, residences: data };
  }
}
