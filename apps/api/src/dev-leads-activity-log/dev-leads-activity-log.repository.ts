import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DevLeadsActivityLog } from './schema/dev-leads-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class DevLeadsActivityLogRepository extends BaseRepository<DevLeadsActivityLog> {
  constructor(
    @InjectModel(DevLeadsActivityLog.name)
    private readonly residenceActivityLogModel: Model<DevLeadsActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
