import { Injectable } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { RefundRequestReason } from './schema/refund-request-reason.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RefundRequestReasonSeeder extends AbstractSeeder {
  public name = RefundRequestReasonSeeder.name;

  constructor(
    @InjectModel(RefundRequestReason.name)
    private readonly refundRequestReasonModel: Model<RefundRequestReason>
  ) {
    super();
  }

  async seed() {
    try {
      const reasons = [
        'Service dissatisfaction',
        'Overpayment',
        'Incorrect charge',
        'System error',
      ];

      // Seed the refund request reasons
      for (const reason of reasons) {
        await this.refundRequestReasonModel.create({
          name: reason,
          isDeleted: false,
        });
      }
    } catch (error) {
      console.error('Error while seeding refund request reasons:', error);
    }
  }
}
