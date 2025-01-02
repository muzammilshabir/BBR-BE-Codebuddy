import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VacancyApplicationActivityLog } from './schema/vacancy-application-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class VacancyApplicationActivityLogRepository extends BaseRepository<VacancyApplicationActivityLog> {
  constructor(
    @InjectModel(VacancyApplicationActivityLog.name) private readonly vacancyApplicationActivityLogModel: Model<VacancyApplicationActivityLog>
  ) {
    super(vacancyApplicationActivityLogModel);
  }
}
