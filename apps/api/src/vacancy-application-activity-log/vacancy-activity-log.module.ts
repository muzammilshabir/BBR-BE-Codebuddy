import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VacancyApplicationActivityLog,
  VacancyApplicationActivityLogSchema,
} from './schema/vacancy-application-activity-log.schema';
import { VacancyApplicationActivityLogService } from './vacancy-application-activity-log.service';
import { VacancyApplicationActivityLogRepository } from './vacancy-application-activity-log.repository';
import { VacancyApplicationActivityLogController } from './vacancy-application-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VacancyApplicationActivityLog.name, schema: VacancyApplicationActivityLogSchema },
    ]),
  ],
  providers: [VacancyApplicationActivityLogService, VacancyApplicationActivityLogRepository],
  controllers: [VacancyApplicationActivityLogController],
  exports: [VacancyApplicationActivityLogService, VacancyApplicationActivityLogRepository],
})
export class VacancyApplicationActivityLogModule {}
