import { Injectable, Logger } from '@nestjs/common';
import { LifeStyleRepository } from './lifeStyle.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class LifeStyleSeeder extends AbstractSeeder {
  public name = LifeStyleSeeder.name;
  private readonly logger = new Logger(LifeStyleSeeder.name);

  constructor(private readonly amenityRepository: LifeStyleRepository) {
    super();
  }

  async seed() {
    try {
      const lifeStyles = [
        { name: 'Investment Opportunities' },
        { name: 'Newest Branded Residences' },
        { name: 'Pet Friendly Residences' },
        { name: 'Beachfront Residences' },
        { name: 'Golf Residences' },
        { name: 'Emerging Markets' },
        { name: 'Best for Couples' },
        { name: 'Ski Resort' },
      ];

      for (const lifeStyle of lifeStyles) {
        await this.amenityRepository.upsert({ name: lifeStyle.name }, lifeStyle);
      }
    } catch (error) {
      this.logger.error('Error seeding LifeStyles', error);
    }
  }
}
