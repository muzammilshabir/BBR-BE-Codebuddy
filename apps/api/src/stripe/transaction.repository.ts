import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Transaction } from './schema/transaction.schema';

@Injectable()
export class TransactionRepository extends BaseRepository<Transaction> {
  constructor(@InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>) {
    super(transactionModel);
  }
  async findByResidenceId(residenceId: string): Promise<Transaction> {
    return this.transactionModel.findOne({ residenceId });
  }
}
