import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeveloperProfileActivityLog, DeveloperProfileActivityLogSchema } from './schema/developer-profile-activity-log.schema';
import { DeveloperProfileActivityLogService } from './developer-profile-activity-log.service';
import { DeveloperProfileActivityLogRepository } from './developer-profile-activity-log.repository';
import { DeveloperProfileActivityLogController } from './developer-profile-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema }]),
  ],
  providers: [DeveloperProfileActivityLogService, DeveloperProfileActivityLogRepository],
  controllers: [DeveloperProfileActivityLogController],
  exports: [DeveloperProfileActivityLogService, DeveloperProfileActivityLogRepository],
})
export class DeveloperProfileActivityLogModule {}
