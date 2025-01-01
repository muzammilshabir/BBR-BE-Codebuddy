import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeadsActivityLog } from './schema/leads-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class LeadsActivityLogRepository extends BaseRepository<LeadsActivityLog> {
  constructor(
    @InjectModel(LeadsActivityLog.name)
    private readonly residenceActivityLogModel: Model<LeadsActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
