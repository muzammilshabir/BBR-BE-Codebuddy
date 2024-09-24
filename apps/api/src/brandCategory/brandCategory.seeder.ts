import { Injectable, Logger } from '@nestjs/common';
import { BrandCategoryRepository } from './brandCategoryRepository.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { BrandCategoryEnum } from './enum/brandCategory-enum';

@Injectable()
export class BrandCategorySeeder extends AbstractSeeder {
  public name = BrandCategorySeeder.name;
  private readonly logger = new Logger(BrandCategorySeeder.name);

  constructor(private readonly brandCategoryRepository: BrandCategoryRepository) {
    super();
  }

  async seed() {
    try {
      const brandCategories = [
        { name: BrandCategoryEnum.AUTOMOTIVE },
        { name: BrandCategoryEnum.FASHION_AND_LIFESTYLE },
        { name: BrandCategoryEnum.LUXURY_HOTEL_AND_RESORT },
      ];

      for (const category of brandCategories) {
        await this.brandCategoryRepository.upsert({ name: category.name }, category);
      }
    } catch (error) {
      this.logger.error('Error seeding brandCategories', error);
    }
  }
}
