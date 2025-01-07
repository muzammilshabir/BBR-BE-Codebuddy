import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';
import { RefundRepository } from './refund.repository';
import { RefundRequestStatus } from './enum/refund-status.enum';

@Injectable()
export class RefundSeeder extends AbstractSeeder {
  public name = RefundSeeder.name;
  private readonly logger = new Logger(RefundSeeder.name);

  constructor(private readonly refundRepository: RefundRepository) {
    super();
  }

  async seed() {
    try {
      const statuses = Object.values(RefundRequestStatus);
      const reasons = [
        'Customer dissatisfaction',
        'Product defect',
        'Incorrect charge',
        'Service not provided',
        'Duplicate charge',
      ];
      const notes = [
        'Processed as requested',
        'Partial refund issued',
        'Full refund provided',
        'Refund denied',
        'Escalated to management',
      ];

      for (let i = 0; i < 15; i++) {
        const refund = {
          invoiceId: new Types.ObjectId(),
          amount: Math.floor(Math.random() * 99000 + 1000) / 100,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          note: notes[Math.floor(Math.random() * notes.length)],
          attachments: [new Types.ObjectId(), new Types.ObjectId()],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };
        await this.refundRepository.create(refund);
      }
    } catch (error) {
      this.logger.error('Error seeding plans and features', error);
    }
  }
}
