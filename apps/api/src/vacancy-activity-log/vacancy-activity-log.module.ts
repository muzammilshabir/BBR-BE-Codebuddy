import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VacancyActivityLog,
  VacancyActivityLogSchema,
} from './schema/vacancy-activity-log.schema';
import { VacancyActivityLogService } from './vacancy-activity-log.service';
import { VacancyActivityLogRepository } from './vacancy-activity-log.repository';
import { VacancyActivityLogController } from './vacancy-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VacancyActivityLog.name, schema: VacancyActivityLogSchema },
    ]),
  ],
  providers: [VacancyActivityLogService, VacancyActivityLogRepository],
  controllers: [VacancyActivityLogController],
  exports: [VacancyActivityLogService, VacancyActivityLogRepository],
})
export class VacancyActivityLogModule {}
