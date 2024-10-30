import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregateOptions, Model, PipelineStage } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Refund } from './schema/refund.schema';

@Injectable()
export class RefundRepository extends BaseRepository<Refund> {
  constructor(@InjectModel(Refund.name) private readonly refundModel: Model<Refund>) {
    super(refundModel);
  }

  async findOneExpanded(id: string) {
    const refund = await this.refundModel.findById(id).populate([
      {
        path: 'invoiceId',
        model: 'Invoice',
        populate: [
          { path: 'residenceId', select: 'name', model: 'Residence' },
          { path: 'developerId', select: 'fullName', model: 'User' },
          'paymentMethod',
        ],
      },
    ]);
    return refund;
  }

  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.refundModel.aggregate(pipeline, options);
  }
}
