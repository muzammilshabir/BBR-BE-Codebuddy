import { Injectable, Logger } from '@nestjs/common';
import { LocationRepository } from './location.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class LocationSeeder extends AbstractSeeder {
  public name = LocationSeeder.name;
  private readonly logger = new Logger(LocationSeeder.name);

  constructor(private readonly locationRepository: LocationRepository) {
    super();
  }

  async seed() {
    try {
      const locations = [
        { type: 'country', name: 'UAE', children: ['Dubai'] },
        { type: 'country', name: 'USA', children: ['Miami', 'New York'] },
        { type: 'country', name: 'Thailand', children: ['Bangkok'] },
      ];

      for (const location of locations) {
        // Create the parent entry (country)
        const country = await this.locationRepository.create({ type: 'country', name: location.name });

        // Create child entries (cities) with parentId set to the country _id
        for (const cityName of location.children) {
          await this.locationRepository.create({ type: 'city', name: cityName, parentId: country._id });
        }
      }

      this.logger.log('Seeding locations completed successfully.');
    } catch (error) {
      this.logger.error('Error while seeding locations:', error);
    }
  }
}
