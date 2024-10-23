import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { InvoiceItem } from './schema/invoice-item.schema';

@Injectable()
export class InvoiceItemRepository extends BaseRepository<InvoiceItem> {
  constructor(@InjectModel(InvoiceItem.name) private readonly invoiceItemModel: Model<InvoiceItem>) {
    super(invoiceItemModel);
  }
  async findByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    return (await this.findAll({ invoiceId })).data;
  }

  async findAllExpanded(filter: any): Promise<any> {
    return this.invoiceItemModel
      .find(filter)
      .populate([{ path: 'invoiceId', select: 'residenceId', model: 'Invoice' }]);
  }
}
