import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Invoice } from './schema/invoice.schema';

@Injectable()
export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor(@InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>) {
    super(invoiceModel);
  }
  async findByResidenceId(residenceId: string): Promise<Invoice> {
    return this.invoiceModel.findOne({ residenceId });
  }
}
