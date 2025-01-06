import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DevRankingActivityLog } from './schema/dev-ranking-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class DevRankingActivityLogRepository extends BaseRepository<DevRankingActivityLog> {
  constructor(
    @InjectModel(DevRankingActivityLog.name)
    private readonly residenceActivityLogModel: Model<DevRankingActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
