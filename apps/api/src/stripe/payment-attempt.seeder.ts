import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { PaymentAttemptStatus } from './enum/payment-attempt-status.enum';

@Injectable()
export class PaymentAttemptSeeder extends AbstractSeeder {
  public name = PaymentAttemptSeeder.name;
  private readonly logger = new Logger(PaymentAttemptSeeder.name);

  constructor(private readonly paymentAttemptRepository: PaymentAttemptRepository) {
    super();
  }

  async seed() {
    try {
      const paymentAttempts = [
        {
          invoiceId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          attemptNumber: 1,
          attemptsRemaining: 2,
          attemptsRemainingToday: 1,
          paymentMethodId: 'pm_123456789',
          stripeInvoiceId: 'in_123456789',
          status: PaymentAttemptStatus.FAILED,
          managed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          invoiceId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          attemptNumber: 2,
          attemptsRemaining: 1,
          attemptsRemainingToday: 0,
          paymentMethodId: 'pm_987654321',
          stripeInvoiceId: 'in_987654321',
          status: PaymentAttemptStatus.SUCCEEDED,
          managed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          invoiceId: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          attemptNumber: 3,
          attemptsRemaining: 0,
          attemptsRemainingToday: 0,
          paymentMethodId: 'pm_246813579',
          stripeInvoiceId: 'in_246813579',
          status: PaymentAttemptStatus.PENDING,
          managed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
  
      await Promise.all(paymentAttempts.map(paymentAttempt => 
        this.paymentAttemptRepository.create(paymentAttempt)
      ));
  
      this.logger.log('Payment attempts seeded successfully');
    } catch (error) {
      this.logger.error('Error seeding payment attempts', error);
    }
  }
}
