import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RankingActivityLog,
  RankingActivityLogSchema,
} from './schema/ranking-activity-log.schema';
import { RankingActivityLogService } from './ranking-activity-log.service';
import { RankingActivityLogRepository } from './ranking-activity-log.repository';
import { RankingActivityLogController } from './ranking-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RankingActivityLog.name, schema: RankingActivityLogSchema },
    ]),
  ],
  providers: [RankingActivityLogService, RankingActivityLogRepository],
  controllers: [RankingActivityLogController],
  exports: [RankingActivityLogService, RankingActivityLogRepository],
})
export class RankingActivityLogModule {}
