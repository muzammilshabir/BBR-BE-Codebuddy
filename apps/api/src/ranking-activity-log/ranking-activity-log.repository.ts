import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingActivityLog } from './schema/ranking-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class RankingActivityLogRepository extends BaseRepository<RankingActivityLog> {
  constructor(
    @InjectModel(RankingActivityLog.name) private readonly rankingActivityLogModel: Model<RankingActivityLog>
  ) {
    super(rankingActivityLogModel);
  }
}
