import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { NewsletterRepository } from './newsletter.repository';
import { Types } from 'mongoose';

@Injectable()
export class NewsletterSeeder extends AbstractSeeder {
  public name = NewsletterSeeder.name;
  private readonly logger = new Logger(NewsletterSeeder.name);

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
  ) {
    super();
  }

  async seed() {
    try {
      const newsletters = [
        {
          email: "test@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          user: new Types.ObjectId('60d5f485f7c6a4b2b8e8b600'),
          email: "test2@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const newsletter of newsletters) {
        await this.newsletterRepository.upsert({ email: newsletter.email }, newsletter);
      }
    } catch (error) {
      this.logger.error('Error seeding newsletters', error);
    }
  }
}