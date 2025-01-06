import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DevResidenceActivityLog,
  DevResidenceActivityLogSchema,
} from './schema/dev-residence-activity-log.schema';
import { DevResidenceActivityLogService } from './dev-residence-activity-log.service';
import { DevResidenceActivityLogRepository } from './dev-residence-activity-log.repository';
import { DevResidenceActivityLogController } from './dev-residence-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DevResidenceActivityLog.name, schema: DevResidenceActivityLogSchema },
    ]),
  ],
  providers: [DevResidenceActivityLogService, DevResidenceActivityLogRepository],
  controllers: [DevResidenceActivityLogController],
  exports: [DevResidenceActivityLogService, DevResidenceActivityLogRepository],
})
export class DevResidenceActivityLogModule {}
