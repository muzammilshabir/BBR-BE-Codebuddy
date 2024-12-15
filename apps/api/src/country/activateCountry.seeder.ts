import { Injectable, Logger } from '@nestjs/common';
import { CountryRepository } from './country.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class ActivateCountrySeeder extends AbstractSeeder {
  public name = ActivateCountrySeeder.name;
  private readonly logger = new Logger(ActivateCountrySeeder.name);

  constructor(private readonly countryRepository: CountryRepository) {
    super();
  }

  async seed() {
    try {
      // Define the countries to be seeded
      const countries = [
        { name: 'USA', active: true, isDeleted: false },
        { name: 'United Arab Emirates', active: true, isDeleted: false },
        { name: 'United Kingdom', active: true, isDeleted: false },
        { name: 'Thailand', active: true, isDeleted: false },
        { name: 'France', active: true, isDeleted: false },
        { name: 'Japan', active: true, isDeleted: false },
        { name: 'Australia', active: true, isDeleted: false },
        { name: 'Spain', active: true, isDeleted: false },
        { name: 'Switzerland', active: true, isDeleted: false },
        { name: 'Singapore', active: true, isDeleted: false },
        { name: 'Hong Kong S.A.R.', active: true, isDeleted: false },
        { name: 'Philippines', active: true, isDeleted: false },
        { name: 'Malaysia', active: true, isDeleted: false },
        { name: 'Turkey', active: true, isDeleted: false },
        { name: 'South Africa', active: true, isDeleted: false },
        { name: 'Canada', active: true, isDeleted: false },
        { name: 'Austria', active: true, isDeleted: false },
        { name: 'Italy', active: true, isDeleted: false },
        { name: 'Greece', active: true, isDeleted: false },
        { name: 'Portugal', active: true, isDeleted: false },
        { name: 'China', active: true, isDeleted: false },
        { name: 'Indonesia', active: true, isDeleted: false },
        { name: 'Maldives', active: true, isDeleted: false },
        { name: 'Brazil', active: true, isDeleted: false },
        { name: 'Morocco', active: true, isDeleted: false },
        { name: 'Monaco', active: true, isDeleted: false },
        { name: 'Argentina', active: true, isDeleted: false },
        { name: 'Chile', active: true, isDeleted: false },
        { name: 'Qatar', active: true, isDeleted: false },
        { name: 'New Zealand', active: true, isDeleted: false },
        { name: 'Nigeria', active: true, isDeleted: false },
        { name: 'Vietnam', active: true, isDeleted: false },
        { name: 'South Korea', active: true, isDeleted: false },
        { name: 'Taiwan', active: true, isDeleted: false },
        { name: 'Saudi Arabia', active: true, isDeleted: false },
        { name: 'Oman', active: true, isDeleted: false },
        { name: 'Mexico', active: true, isDeleted: false },
        { name: 'Bahamas', active: true, isDeleted: false },
        { name: 'Dominican Republic', active: true, isDeleted: false },
        { name: 'Jamaica', active: true, isDeleted: false },
        { name: 'Turks and Caicos', active: true, isDeleted: false },
        { name: 'Puerto Rico', active: true, isDeleted: false },
        { name: 'Colombia', active: true, isDeleted: false },
        { name: 'Peru', active: true, isDeleted: false }
      ];

      // Seed the countries
     
      for (const country of countries) {
        await this.countryRepository.updateWithFilter(
          { name: { $regex: `^${country.name.replace(/[()]/g, '\\$&')}$` }, isDeleted: false },
          { $set: { active: true } }
        );
      }
    } catch (error) {
      this.logger.error('Error while seeding countries:', error);
    }
  }
}
