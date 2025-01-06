import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DevResidenceActivityLog } from './schema/dev-residence-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class DevResidenceActivityLogRepository extends BaseRepository<DevResidenceActivityLog> {
  constructor(
    @InjectModel(DevResidenceActivityLog.name) private readonly residenceActivityLogModel: Model<DevResidenceActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
