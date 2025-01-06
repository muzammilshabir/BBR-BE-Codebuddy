import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevLeadsActivityLog, DevLeadsActivityLogSchema } from './schema/dev-leads-activity-log.schema';
import { DevLeadsActivityLogService } from './dev-leads-activity-log.service';
import { DevLeadsActivityLogRepository } from './dev-leads-activity-log.repository';
import { DevLeadsActivityLogController } from './dev-leads-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DevLeadsActivityLog.name, schema: DevLeadsActivityLogSchema }]),
  ],
  providers: [DevLeadsActivityLogService, DevLeadsActivityLogRepository],
  controllers: [DevLeadsActivityLogController],
  exports: [DevLeadsActivityLogService, DevLeadsActivityLogRepository],
})
export class DevLeadsActivityLogModule {}
