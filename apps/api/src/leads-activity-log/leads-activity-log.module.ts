import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsActivityLog, LeadsActivityLogSchema } from './schema/leads-activity-log.schema';
import { LeadsActivityLogService } from './leads-activity-log.service';
import { LeadsActivityLogRepository } from './leads-activity-log.repository';
import { LeadsActivityLogController } from './leads-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LeadsActivityLog.name, schema: LeadsActivityLogSchema }]),
  ],
  providers: [LeadsActivityLogService, LeadsActivityLogRepository],
  controllers: [LeadsActivityLogController],
  exports: [LeadsActivityLogService, LeadsActivityLogRepository],
})
export class LeadsActivityLogModule {}
