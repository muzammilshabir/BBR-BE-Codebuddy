import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { DeveloperProfileActivityLog } from './schema/developer-profile-activity-log.schema';

@Injectable()
export class DeveloperProfileActivityLogRepository extends BaseRepository<DeveloperProfileActivityLog> {
  constructor(
    @InjectModel(DeveloperProfileActivityLog.name)
    private readonly developerProfileActivityLogModel: Model<DeveloperProfileActivityLog>
  ) {
    super(developerProfileActivityLogModel);
  }
}
