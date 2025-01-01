import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandActivityLog } from './schema/brand-activity-log.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class BrandActivityLogRepository extends BaseRepository<BrandActivityLog> {
  constructor(
    @InjectModel(BrandActivityLog.name) private readonly residenceActivityLogModel: Model<BrandActivityLog>
  ) {
    super(residenceActivityLogModel);
  }
}
