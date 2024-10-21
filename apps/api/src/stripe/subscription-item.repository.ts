import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { SubscriptionItem } from './schema/subscription-item.schema';

@Injectable()
export class SubscriptionItemRepository extends BaseRepository<SubscriptionItem> {
  constructor(@InjectModel(SubscriptionItem.name) private readonly subscriptionItemModel: Model<SubscriptionItem>) {
    super(subscriptionItemModel);
  }
  async findByInvoiceId(invoiceId: string): Promise<SubscriptionItem[]> {
    return (await this.findAll({ invoiceId })).data;
  }
}
