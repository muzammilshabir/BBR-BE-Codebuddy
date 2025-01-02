import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VacancyActivityLog } from './schema/vacancy-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class VacancyActivityLogRepository extends BaseRepository<VacancyActivityLog> {
  constructor(
    @InjectModel(VacancyActivityLog.name) private readonly vacancyActivityLogModel: Model<VacancyActivityLog>
  ) {
    super(vacancyActivityLogModel);
  }
}
