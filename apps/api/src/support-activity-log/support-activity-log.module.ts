import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SupportActivityLog,
  SupportActivityLogSchema,
} from './schema/support-activity-log.schema';
import { SupportActivityLogService } from './support-activity-log.service';
import { SupportActivityLogRepository } from './support-activity-log.repository';
import { SupportActivityLogController } from './support-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportActivityLog.name, schema: SupportActivityLogSchema },
    ]),
  ],
  providers: [SupportActivityLogService, SupportActivityLogRepository],
  controllers: [SupportActivityLogController],
  exports: [SupportActivityLogService, SupportActivityLogRepository],
})
export class SupportActivityLogModule {}
