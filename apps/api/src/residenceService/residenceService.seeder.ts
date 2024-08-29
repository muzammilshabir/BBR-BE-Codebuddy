import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { ResidenceServiceRepository } from './residenceService.repository';

@Injectable()
export class ResidenceServiceSeeder extends AbstractSeeder {
  public name = ResidenceServiceSeeder.name;
  private readonly logger = new Logger(ResidenceServiceSeeder.name);

  constructor(private readonly residenceServiceRepository: ResidenceServiceRepository) {
    super();
  }

  async seed() {
    try {
      const residenceServiceTypes = [
        { type: 'Cooking' },
        { type: 'Cleaning' },
        { type: 'Laundry' },
      ];

      for (const service of residenceServiceTypes) {
        await this.residenceServiceRepository.upsert(
          { type: service.type },
          {
            ...service,
            isDeleted: false,
          }
        );
      }
    } catch (error) {
      this.logger.error('Error while seeding residence Service Types:', error);
    }
  }
}
