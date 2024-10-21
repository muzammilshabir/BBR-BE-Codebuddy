import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { PaymentAttempt } from './schema/payment-attempt.schema';

@Injectable()
export class PaymentAttemptRepository extends BaseRepository<PaymentAttempt> {
  constructor(@InjectModel(PaymentAttempt.name) private readonly paymentAttemptModel: Model<PaymentAttempt>) {
    super(paymentAttemptModel);
  }

  async findByInvoiceId(invoiceId: string): Promise<PaymentAttempt[]> {
    return (await this.findAll({ invoiceId })).data;
  }
}
