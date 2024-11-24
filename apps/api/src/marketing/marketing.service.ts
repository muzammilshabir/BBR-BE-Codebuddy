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

        let currentPlan = null;
        let availablePlans ;

        if (residence?.planId) {
          
            currentPlan = await this.planRepository.findById(residence.planId.toString());

            if (!currentPlan) {
            throw new NotFoundException(`Plan with id:${residence.planId} not found`);
            }

            availablePlans = await this.planRepository.find({
            fee: { $gte: currentPlan.fee },
            isDeleted: false,
            });

        } else {
       
            availablePlans = await this.planRepository.find({ isDeleted: false });
        }
            
        const currentRankings = await this.rankingRequestRepository.findRankings({
            residenceId: new Types.ObjectId(residenceIdDto.residenceId),
            status: RankingRequestStatus.ACTIVE ,
        });

        const rankingOpportunities = await this.rankingCategoryRepository.findAll({
            status: RankingCategoryStatus.ACTIVE,
            _id: { $nin: currentRankings?.map((ranking) => ranking?.rankingCategoryId?._id) },
            countryId: residence.countryId,
            isDeleted: false,
        });
    
        const planDetails = {
            currentPlan: currentPlan
              ? {
                  id: currentPlan._id,
                  name: currentPlan.name,
                  fee: currentPlan.fee,
                  billingCycle: currentPlan.billingCycle,
                }
              : null,
            availablePlans: availablePlans?.map((plan) => ({
              id: plan?._id,
              name: plan.name,
              fee: plan.fee,
              billingCycle: plan.billingCycle,
            })),
        };

        return {
            currentRankings,
            rankingOpportunities,
            planDetails,
          };

    }
}
