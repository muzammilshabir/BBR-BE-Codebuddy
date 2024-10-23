import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Subscription } from './schema/subscription.schema';

@Injectable()
export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor(@InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>) {
    super(subscriptionModel);
  }
  async findByInvoiceId(invoiceId: string): Promise<Subscription[]> {
    return (await this.findAll({ invoiceId })).data;
  }
}
