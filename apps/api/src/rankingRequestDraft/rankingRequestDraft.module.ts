import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingRequestDraftService } from './rankingRequestDraft.service';
import { RankingRequestDraftController } from './rankingRequestDraft.controller';
import { RankingRequestDraftRepository } from './rankingRequestDraft.repository';
import {
  RankingRequestDraft,
  RankingRequestDraftSchema,
} from './schema/rankingRequestDraft.schema';
import {
  RankingRequest,
  RankingRequestSchema,
} from '../rankingRequest/schema/rankingRequest.schema';
import { RankingRequestModule } from '../rankingRequest/rankingRequest.module';
import { RankingRequestRepository } from '../rankingRequest/rankingRequest.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RankingRequestDraft.name, schema: RankingRequestDraftSchema },
    ]),
    RankingRequestModule,
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
  ],
  providers: [RankingRequestDraftService, RankingRequestDraftRepository, RankingRequestRepository],
  exports: [RankingRequestDraftService],
  controllers: [RankingRequestDraftController],
})
export class RankingRequestDraftModule {}
