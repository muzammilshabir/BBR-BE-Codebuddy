import { Injectable, Logger } from '@nestjs/common';
import { AmenityRepository } from './amenities.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class AmenitySeeder extends AbstractSeeder {
  public name = AmenitySeeder.name;
  private readonly logger = new Logger(AmenitySeeder.name);

  constructor(private readonly amenityRepository: AmenityRepository) {
    super();
  }

  async seed() {
    try {
      const amenities = [
        { name: 'Swimming pool' },
        { name: 'Private Beach access' },
        { name: 'Gym/Fitness center' },
        { name: 'Golf course access' },
      ];

      for (const amenity of amenities) {
        await this.amenityRepository.upsert({ name: amenity.name }, amenity);
      }

    } catch (error) {
      this.logger.error('Error seeding Amenities', error);
    }
  }
}
