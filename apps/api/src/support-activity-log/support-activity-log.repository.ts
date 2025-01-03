import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportActivityLog } from './schema/support-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class SupportActivityLogRepository extends BaseRepository<SupportActivityLog> {
  constructor(
    @InjectModel(SupportActivityLog.name) private readonly residenceActivityLogModel: Model<SupportActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
