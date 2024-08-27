import { Injectable, Logger } from '@nestjs/common';
import { CountryRepository } from './country.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class CountrySeeder extends AbstractSeeder {
  public name = CountrySeeder.name;
  private readonly logger = new Logger(CountrySeeder.name);

  constructor(private readonly countryRepository: CountryRepository) {
    super();
  }

  async seed() {
    try {
      // Define the countries to be seeded
      const countries = [
        { name: 'USA', isDeleted: false },
        { name: 'United Arab Emirates', isDeleted: false },
        { name: 'United Kingdom', isDeleted: false },
        { name: 'Thailand', isDeleted: false },
        { name: 'France', isDeleted: false },
        { name: 'Japan', isDeleted: false },
        { name: 'Australia', isDeleted: false },
        { name: 'Spain', isDeleted: false },
        { name: 'Switzerland', isDeleted: false },
        { name: 'Singapore', isDeleted: false },
        { name: 'Hong Kong', isDeleted: false },
        { name: 'Philippines', isDeleted: false },
        { name: 'Malaysia', isDeleted: false },
        { name: 'Turkey', isDeleted: false },
        { name: 'South Africa', isDeleted: false },
        { name: 'Canada', isDeleted: false },
        { name: 'Austria', isDeleted: false },
        { name: 'Italy', isDeleted: false },
        { name: 'Greece', isDeleted: false },
        { name: 'Portugal', isDeleted: false },
        { name: 'China', isDeleted: false },
        { name: 'Indonesia', isDeleted: false },
        { name: 'Maldives', isDeleted: false },
        { name: 'Brazil', isDeleted: false },
        { name: 'Morocco', isDeleted: false },
        { name: 'Monaco', isDeleted: false },
        { name: 'Argentina', isDeleted: false },
        { name: 'Chile', isDeleted: false },
        { name: 'Qatar', isDeleted: false },
        { name: 'New Zealand', isDeleted: false },
        { name: 'Nigeria', isDeleted: false },
        { name: 'Vietnam', isDeleted: false },
        { name: 'South Korea', isDeleted: false },
        { name: 'Taiwan', isDeleted: false },
        { name: 'Saudi Arabia', isDeleted: false },
        { name: 'Oman', isDeleted: false },
        { name: 'Mexico', isDeleted: false },
        { name: 'Bahamas', isDeleted: false },
        { name: 'Dominican Republic', isDeleted: false },
        { name: 'Jamaica', isDeleted: false },
        { name: 'Turks and Caicos', isDeleted: false },
        { name: 'Puerto Rico', isDeleted: false },
        { name: 'Colombia', isDeleted: false },
        { name: 'Peru', isDeleted: false },
      ];

      // Seed the countries
      for (const country of countries) {
        await this.countryRepository.create(country);
      }
    } catch (error) {
      this.logger.error('Error while seeding countries:', error);
    }
  }
}
