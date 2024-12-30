import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from './schema/residence-activity-log.schema';
import { ResidenceActivityLogService } from './residence-activity-log.service';
import { ResidenceActivityLogRepository } from './residence-activity-log.repository';
import { ResidenceActivityLogController } from './residence-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
  ],
  providers: [ResidenceActivityLogService, ResidenceActivityLogRepository],
  controllers: [ResidenceActivityLogController],
  exports: [ResidenceActivityLogService, ResidenceActivityLogRepository],
})
export class ResidenceActivityLogModule {}
