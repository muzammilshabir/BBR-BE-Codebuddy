import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import { RankingRequestRepository } from 'src/rankingRequest/rankingRequest.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { UserRepository } from 'src/users/user.repository';
import { ResidenceIdDto } from './dto/upgrade-option.dto';
import { ResidenceStatus } from 'src/residences/enum/residence-enum';
import { Types } from 'mongoose';
import { RankingRequestStatus } from 'src/rankingRequest/enum/rankingRequest-status.enum';
import { RankingCategoryStatus } from 'src/rankingCategory/enum/rankingCategory-status.enum';
import { PlanRepository } from 'src/subscription-plan/plan.repository';
import { PaymentStatus } from 'src/rankingRequest/enum/payment-status.enum';
import { CategoryType } from 'src/rankingCategory/enum/category-type.enum';
import { RankingRequest } from 'src/rankingRequest/schema/rankingRequest.schema';
import { DeletionStatus } from 'src/unit/enum/unit-enum';

@Injectable()
export class MarketingService {
  constructor(
    private readonly rankingRequestRepository: RankingRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly planRepository: PlanRepository
  ) {}

  async getFeatures(residenceIdDto: ResidenceIdDto) {
    const residence = await this.residenceRepository.findById(residenceIdDto.residenceId);

    if (!residence) {
      throw new NotFoundException(`Residence with id:${residenceIdDto.residenceId}`);
    }
    if (residence.status !== ResidenceStatus.ACTIVE) {
      throw new BadRequestException(
        `Residence with id:${residenceIdDto.residenceId} is not active`
      );
    }

    const { currentRankings, rankingOpportunities } = await this.getRankingOpportunities(
      residenceIdDto.residenceId
    );

    const planDetails = await this.getResidencePlans(residence.planId);

    return {
      currentRankings,
      rankingOpportunities,
      planDetails,
    };
  }

  async getRankingOpportunities(residenceId: string) {
    const residence = await this.residenceRepository.findByIdInDetail(residenceId);
    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }

    const currentRankings = await this.rankingRequestRepository.findRankings({
      residenceId: new Types.ObjectId(residenceId),
      status: RankingRequestStatus.ACTIVE,
      paymentStatus: PaymentStatus.PAID,
    });

    const currentRankingCategoryIds = currentRankings.map((r) => r.rankingCategoryId);

    const excludeAlreadyRanked = { _id: { $nin: currentRankingCategoryIds } };

    const propertyTypeCategoryIds = currentRankings
      .filter((r) => r?.rankingCategory?.categoryType === CategoryType.PROPERTY_TYPE)
      .map((r) => r._id);

    const lifestyleCategoryIds = currentRankings
      .filter((r) => r?.rankingCategory?.categoryType === CategoryType.LIFESTYLE)
      .map((r) => r._id);

    // Dynamically build conditions
    const applicableConditions: any = [{ categoryType: CategoryType.WORLDWIDE }];

    if (residence.countryId) {
      applicableConditions.push({
        categoryType: CategoryType.COUNTRY,
        countryId: residence.countryId?._id,
      });
    }

    if (residence.cityId) {
      applicableConditions.push({
        categoryType: CategoryType.CITY,
        cityId: residence.cityId._id,
      });
    }

    if (residence.associatedBrandId) {
      applicableConditions.push({
        categoryType: CategoryType.BRAND,
        brandId: residence.associatedBrandId._id,
      });
    }

    if (propertyTypeCategoryIds?.length > 0) {
      applicableConditions.push({
        categoryType: CategoryType.PROPERTY_TYPE,
        propertyTypeId: {
          $nin: propertyTypeCategoryIds,
        },
      });
    }

    if (lifestyleCategoryIds?.length > 0) {
      applicableConditions.push({
        categoryType: CategoryType.LIFESTYLE,
        lifeStyleId: {
          $nin: lifestyleCategoryIds,
        },
      });
    }

    const rankingOpportunities = await this.rankingCategoryRepository.rankingCategories({
      status: RankingCategoryStatus.ACTIVE,
      isDeleted: false,
      ...excludeAlreadyRanked,
      $or: applicableConditions,
    });

    return {
      currentRankings:await this.findPosition(currentRankings),
      rankingOpportunities,
    };
  }

  private async findPosition(rankings) {
    const rankingMap: Map<string, RankingRequest[]> = new Map();

    const updatedRankings = await Promise.all(
      rankings.map(async (ranking) => {
        const rankingCategoryId = ranking.rankingCategory._id.toString();

        let categoryRankings = rankingMap.get(rankingCategoryId);
        if (!categoryRankings) {
          const { data: newRankings } = await this.rankingRequestRepository.findAll(
            {
              rankingCategoryId: new Types.ObjectId(rankingCategoryId),
              isDeleted: { $ne: DeletionStatus.DELETED },
              bbrScore: { $exists: true },
              status: {
                $in: [
                  RankingCategoryStatus.ACTIVE,
                  RankingCategoryStatus.DRAFT,
                  RankingCategoryStatus.PENDING,
                ],
              },
            },
            {
              sort: { bbrScore: -1 },
            }
          );
          categoryRankings = newRankings;
          rankingMap.set(rankingCategoryId, newRankings);
        }

        const position = categoryRankings.findIndex(
          (r) => r._id.toString() === ranking._id.toString()
        );

        return {
          ...ranking,
          position,
          totalRequest: categoryRankings.length,
        };
      })
    );

    return updatedRankings;
  }
  private async getResidencePlans(planId: Types.ObjectId | null) {
    let currentPlan = null;
    let availablePlans = [];

    if (planId) {
      currentPlan = await this.planRepository.findById(planId.toString());

      if (!currentPlan) {
        throw new NotFoundException(`Plan with id:${planId} not found`);
      }

      const plansResult = await this.planRepository.findAllExpanded({
        $and: [
          { fee: { $gt: currentPlan.fee } },
          { _id: { $ne: currentPlan._id } },
          { isDeleted: false },
          { active: true },
        ],
      });
      availablePlans = plansResult || [];
    } else {
      const plansResult = await this.planRepository.findAllExpanded({
        isDeleted: false,
        active: true,
      });
      availablePlans = plansResult || [];
    }

    return {
      currentPlan: currentPlan
        ? {
            id: currentPlan._id,
            name: currentPlan.name,
            fee: currentPlan.fee,
            billingCycle: currentPlan.billingCycle,
            features: currentPlan.features,
          }
        : null,
      availablePlans: availablePlans.map((plan) => ({
        id: plan._id,
        name: plan.name,
        fee: plan.fee,
        billingCycle: plan.billingCycle,
        features: plan.features,
      })),
    };
  }
}
