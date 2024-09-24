import { Injectable, Logger } from '@nestjs/common';
import { CityRepository } from './city.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { CountryRepository } from '../country/country.repository';
import { Types } from 'mongoose';

@Injectable()
export class CitySeeder extends AbstractSeeder {
  public name = CitySeeder.name;
  private readonly logger = new Logger(CitySeeder.name);

  constructor(
    private readonly cityRepository: CityRepository,
    private readonly countryRepository: CountryRepository
  ) {
    super();
  }

  async seed() {
    try {
      // List of cities with their corresponding country names
      const cities = [
        { name: 'Miami', countryName: 'USA' },
        { name: 'Dubai', countryName: 'United Arab Emirates' },
        { name: 'New York', countryName: 'USA' },
        { name: 'London', countryName: 'United Kingdom' },
        { name: 'Bangkok', countryName: 'Thailand' },
        { name: 'Los Angeles', countryName: 'USA' },
        { name: 'Hong Kong', countryName: 'Hong Kong' },
        { name: 'Singapore', countryName: 'Singapore' },
        { name: 'Paris', countryName: 'France' },
        { name: 'Tokyo', countryName: 'Japan' },
        { name: 'Sydney', countryName: 'Australia' },
        { name: 'Toronto', countryName: 'Canada' },
        { name: 'Istanbul', countryName: 'Turkey' },
        { name: 'Manila', countryName: 'Philippines' },
        { name: 'Kuala Lumpur', countryName: 'Malaysia' },
        { name: 'Cape Town', countryName: 'South Africa' },
        { name: 'Melbourne', countryName: 'Australia' },
        { name: 'Barcelona', countryName: 'Spain' },
        { name: 'Vienna', countryName: 'Austria' },
        { name: 'Zurich', countryName: 'Switzerland' },
        { name: 'Chicago', countryName: 'USA' },
        { name: 'Shanghai', countryName: 'China' },
        { name: 'Beijing', countryName: 'China' },
        { name: 'Bali', countryName: 'Indonesia' },
        { name: 'Maldives', countryName: 'Maldives' },
        { name: 'Rio de Janeiro', countryName: 'Brazil' },
        { name: 'São Paulo', countryName: 'Brazil' },
        { name: 'Marrakech', countryName: 'Morocco' },
        { name: 'Monaco', countryName: 'Monaco' },
        { name: 'Nice', countryName: 'France' },
        { name: 'Lisbon', countryName: 'Portugal' },
        { name: 'Rome', countryName: 'Italy' },
        { name: 'Milan', countryName: 'Italy' },
        { name: 'Athens', countryName: 'Greece' },
        { name: 'Mykonos', countryName: 'Greece' },
        { name: 'Phuket', countryName: 'Thailand' },
        { name: 'Koh Samui', countryName: 'Thailand' },
        { name: 'Honolulu', countryName: 'USA' },
        { name: 'Las Vegas', countryName: 'USA' },
        { name: 'San Francisco', countryName: 'USA' },
        { name: 'Dallas', countryName: 'USA' },
        { name: 'Houston', countryName: 'USA' },
        { name: 'Seattle', countryName: 'USA' },
        { name: 'Vancouver', countryName: 'Canada' },
        { name: 'Montreal', countryName: 'Canada' },
        { name: 'Panama City', countryName: 'Panama' },
        { name: 'Buenos Aires', countryName: 'Argentina' },
        { name: 'Santiago', countryName: 'Chile' },
        { name: 'Abu Dhabi', countryName: 'United Arab Emirates' },
        { name: 'Doha', countryName: 'Qatar' },
        { name: 'Monte Carlo', countryName: 'Monaco' },
        { name: 'Geneva', countryName: 'Switzerland' },
        { name: 'St. Moritz', countryName: 'Switzerland' },
        { name: 'Aspen', countryName: 'USA' },
        { name: 'Lake Como', countryName: 'Italy' },
        { name: 'Portofino', countryName: 'Italy' },
        { name: 'Amalfi Coast', countryName: 'Italy' },
        { name: 'Bora Bora', countryName: 'French Polynesia' },
        { name: 'Queenstown', countryName: 'New Zealand' },
        { name: 'Auckland', countryName: 'New Zealand' },
        { name: 'Johannesburg', countryName: 'South Africa' },
        { name: 'Lagos', countryName: 'Nigeria' },
        { name: 'Ho Chi Minh City', countryName: 'Vietnam' },
        { name: 'Hanoi', countryName: 'Vietnam' },
        { name: 'Seoul', countryName: 'South Korea' },
        { name: 'Taipei', countryName: 'Taiwan' },
        { name: 'Macau', countryName: 'China' },
        { name: 'Riyadh', countryName: 'Saudi Arabia' },
        { name: 'Muscat', countryName: 'Oman' },
        { name: 'Mexico City', countryName: 'Mexico' },
        { name: 'Cancun', countryName: 'Mexico' },
        { name: 'Punta Cana', countryName: 'Dominican Republic' },
        { name: 'Nassau', countryName: 'Bahamas' },
        { name: 'Montego Bay', countryName: 'Jamaica' },
        { name: 'Providenciales', countryName: 'Turks and Caicos' },
        { name: 'San Juan', countryName: 'Puerto Rico' },
        { name: 'Cartagena', countryName: 'Colombia' },
        { name: 'Lima', countryName: 'Peru' },
        { name: 'Santo Domingo', countryName: 'Dominican Republic' },
        { name: 'Medellin', countryName: 'Colombia' },
      ];

      // Seed the cities
      for (const city of cities) {
        // Find the country by name
        const country = await this.countryRepository.find({ name: city.countryName });

        if (!country) {
          this.logger.warn(`Country not found: ${city.countryName}`);
          continue;
        }

        // Create city entry with the country ID
        await this.cityRepository.create({
          name: city.name,
          countryId: country._id as Types.ObjectId,
          isDeleted: false,
        });
      }
    } catch (error) {
      this.logger.error('Error while seeding cities:', error);
    }
  }
}
