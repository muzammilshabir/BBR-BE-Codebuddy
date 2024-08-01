import { Injectable, Logger } from '@nestjs/common';
import { BrandRepository } from './brand.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class BrandSeeder extends AbstractSeeder {
  public name = BrandSeeder.name;
  private readonly logger = new Logger(BrandSeeder.name);

  constructor(private readonly brandRepository: BrandRepository) {
    super();
  }

  async seed() {
    try {
      const brands = [
        { name: 'Private Homes' },
        { name: 'The Ritz-Carlton' },
        { name: 'Aston Martin' },
        { name: 'Four Seasons' },
      ];

      for (const brand of brands) {
        await this.brandRepository.upsert({ name: brand.name }, brand);
      }

    } catch (error) {
      this.logger.error('Error seeding brands', error);
    }
  }
}