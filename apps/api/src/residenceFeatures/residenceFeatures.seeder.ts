import { Injectable, Logger } from '@nestjs/common';
import { ResidenceFeatureRepository } from './residenceFeatures.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class ResidenceFeatureSeeder extends AbstractSeeder {
  public name = ResidenceFeatureSeeder.name;
  private readonly logger = new Logger(ResidenceFeatureSeeder.name);

  constructor(private readonly residenceFeatureRepository: ResidenceFeatureRepository) {
    super();
  }

  async seed() {
    try {
      const features = [
        { name: 'Balcony/Terrace' },
        { name: 'Garden/Yard' },
        { name: 'Fireplace' },
        { name: 'Elevator' },
      ];

      for (const feature of features) {
        await this.residenceFeatureRepository.upsert({ name: feature.name }, feature);
      }

      this.logger.log('ResidenceFeatures seeded successfully.');
    } catch (error) {
      this.logger.error('Error seeding ResidenceFeatures', error);
    }
  }
}
