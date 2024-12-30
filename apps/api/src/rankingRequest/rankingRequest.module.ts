import { ResidenceActivityLogRepository } from './../residence-activity-log/residence-activity-log.repository';
import { ResidenceActivityLog, ResidenceActivityLogSchema } from './../residence-activity-log/schema/residence-activity-log.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingRequestService } from './rankingRequest.service';
import { RankingRequestController } from './rankingRequest.controller';
import { RankingRequestRepository } from './rankingRequest.repository';
import { RankingRequest, RankingRequestSchema } from './schema/rankingRequest.schema';
import { RankingRequestDraftRepository } from '../rankingRequestDraft/rankingRequestDraft.repository';
import {
  RankingRequestDraft,
  RankingRequestDraftSchema,
} from '../rankingRequestDraft/schema/rankingRequestDraft.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { UserRepository } from '../users/user.repository';
import { ResidenceRepository } from '../residences/residences.repository';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { RankingCategoryRepository } from '../rankingCategory/rankingCategory.repository';
import {
  RankingCategory,
  RankingCategorySchema,
} from '../rankingCategory/schema/rankingCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
    MongooseModule.forFeature([
      { name: RankingRequestDraft.name, schema: RankingRequestDraftSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    MongooseModule.forFeature([{ name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema }]),
  ],
  controllers: [RankingRequestController],
  providers: [
    RankingRequestService,
    RankingRequestRepository,
    RankingRequestDraftRepository,
    UserRepository,
    ResidenceRepository,
    RankingCategoryRepository,
    ResidenceActivityLogRepository,
  ],
})
export class RankingRequestModule {}
