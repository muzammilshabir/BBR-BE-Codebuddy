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
        { name: 'Worldwide', type: 'Region', upload: [], isDeleted: false },
        { name: 'Asia', type: 'Continent', upload: [], isDeleted: false },
        { name: 'North America', type: 'Continent', upload: [], isDeleted: false },
        { name: 'Middle East', type: 'Region', upload: [], isDeleted: false },
        { name: 'Europe', type: 'Continent', upload: [], isDeleted: false },
        { name: 'Oceania', type: 'Continent', upload: [], isDeleted: false },
        { name: 'South America', type: 'Continent', upload: [], isDeleted: false },
        { name: 'Africa', type: 'Continent', upload: [], isDeleted: false },
      ];

      for (const area of geographicalAreas) {
        await this.geographicalAreasRepository.create(area);
      }
    } catch (error) {
      this.logger.error('Error while seeding geographical areas:', error);
    }
  }
}
