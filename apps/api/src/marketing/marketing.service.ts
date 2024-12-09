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
            
        const currentRankings = await this.rankingRequestRepository.findRankings({
            residenceId: new Types.ObjectId(residenceIdDto.residenceId),
            status: RankingRequestStatus.ACTIVE ,
            paymentStatus: PaymentStatus.PAID
        });

        const rankingOpportunities = await this.rankingCategoryRepository.findAll({
            status: RankingCategoryStatus.ACTIVE,
            _id: { $nin: currentRankings?.map((ranking) => ranking?.rankingCategoryId?._id) },
            isDeleted: false,
        });

        const planDetails = await this.getResidencePlans(residence.planId);
    
        return {
            currentRankings,
            rankingOpportunities,
            planDetails,
          };

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
                    { active: true }
                ]
            });
            availablePlans = plansResult || [];
        } else {
            const plansResult = await this.planRepository.findAllExpanded({ 
                isDeleted: false,
                active: true
            });
            availablePlans = plansResult || [];
        }
    
        return {
            currentPlan: currentPlan ? {
                id: currentPlan._id,
                name: currentPlan.name,
                fee: currentPlan.fee,
                billingCycle: currentPlan.billingCycle,
                features: currentPlan.features
            } : null,
            availablePlans: availablePlans.map(plan => ({
                id: plan._id,
                name: plan.name,
                fee: plan.fee,
                billingCycle: plan.billingCycle,
                features: plan.features
            }))
        };
    }
    
}
