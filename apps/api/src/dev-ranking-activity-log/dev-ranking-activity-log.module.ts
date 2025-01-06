import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevRankingActivityLog, DevRankingActivityLogSchema } from './schema/dev-ranking-activity-log.schema';
import { DevRankingActivityLogService } from './dev-ranking-activity-log.service';
import { DevRankingActivityLogRepository } from './dev-ranking-activity-log.repository';
import { DevRankingActivityLogController } from './dev-ranking-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DevRankingActivityLog.name, schema: DevRankingActivityLogSchema }]),
  ],
  providers: [DevRankingActivityLogService, DevRankingActivityLogRepository],
  controllers: [DevRankingActivityLogController],
  exports: [DevRankingActivityLogService, DevRankingActivityLogRepository],
})
export class DevRankingActivityLogModule {}
