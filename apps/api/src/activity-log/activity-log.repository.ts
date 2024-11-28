import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from './schema/activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor(
    @InjectModel(ActivityLog.name) private readonly activityLogModel: Model<ActivityLog>
  ) {
    super(activityLogModel);
  }
}
