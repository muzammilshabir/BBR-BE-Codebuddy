import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { ResidenceTypeRepository } from './residenceType.repository';

@Injectable()
export class ResidenceTypeSeeder extends AbstractSeeder {
  public name = ResidenceTypeSeeder.name;
  private readonly logger = new Logger(ResidenceTypeSeeder.name);

  constructor(private readonly residenceTypeRepository: ResidenceTypeRepository) {
    super();
  }

  async seed() {
    try {
      const residenceTypes = [
        { type: 'Condo' },
        { type: 'Villa' },
        { type: 'Penthouse' },
        { type: 'Townhouse' },
        { type: 'Estate Home' },
      ];

      for (const type of residenceTypes) {
        await this.residenceTypeRepository.upsert({ type: type.type }, type);
      }
    } catch (error) {
      this.logger.error('Error while seeding residence types:', error);
    }
  }
}
