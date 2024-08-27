import { Injectable, Logger } from '@nestjs/common';
import { GeographicalAreasRepository } from './geographicalAreas.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class GeographicalAreasSeeder extends AbstractSeeder {
  public name = GeographicalAreasSeeder.name;
  private readonly logger = new Logger(GeographicalAreasSeeder.name);

  constructor(private readonly geographicalAreasRepository: GeographicalAreasRepository) {
    super();
  }

  async seed() {
    try {
      // Define the geographical areas to be seeded
      const geographicalAreas = [
        { name: 'Worldwide', type: 'Region', upload: [] },
        { name: 'Asia', type: 'Continent', upload: [] },
        { name: 'North America', type: 'Continent', upload: [] },
        { name: 'Middle East', type: 'Region', upload: [] },
        { name: 'Europe', type: 'Continent', upload: [] },
        { name: 'Oceania', type: 'Continent', upload: [] },
        { name: 'South America', type: 'Continent', upload: [] },
        { name: 'Africa', type: 'Continent', upload: [] },
      ];

      for (const area of geographicalAreas) {
        await this.geographicalAreasRepository.create(area);
      }
    } catch (error) {
      this.logger.error('Error while seeding geographical areas:', error);
    }
  }
}
