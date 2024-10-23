import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Refund } from './schema/refund.schema';

@Injectable()
export class RefundRepository extends BaseRepository<Refund> {
  constructor(@InjectModel(Refund.name) private readonly refundModel: Model<Refund>) {
    super(refundModel);
  }
}
