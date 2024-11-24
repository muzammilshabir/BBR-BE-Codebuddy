import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { RankingRequest, RankingRequestSchema } from 'src/rankingRequest/schema/rankingRequest.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Residence, ResidenceSchema } from 'src/residences/schema/residences.schema';
import { RankingCategory, RankingCategorySchema } from 'src/rankingCategory/schema/rankingCategory.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingRequestRepository } from 'src/rankingRequest/rankingRequest.repository';
import { UserRepository } from 'src/users/user.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import { Plan, PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { PlanRepository } from 'src/subscription-plan/plan.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema  }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  providers: [
    MarketingService,
    RankingRequestRepository,
    UserRepository,
    ResidenceRepository,
    RankingCategoryRepository,
    PlanRepository
  ],
  controllers: [MarketingController]
})
export class MarketingModule {}
