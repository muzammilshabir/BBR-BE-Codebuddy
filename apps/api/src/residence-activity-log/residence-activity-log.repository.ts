import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceActivityLog } from './schema/residence-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceActivityLogRepository extends BaseRepository<ResidenceActivityLog> {
  constructor(
    @InjectModel(ResidenceActivityLog.name) private readonly residenceActivityLogModel: Model<ResidenceActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
