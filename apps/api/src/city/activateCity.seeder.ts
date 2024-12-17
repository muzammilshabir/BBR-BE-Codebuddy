import { Injectable, Logger } from '@nestjs/common';
import { CityRepository } from './city.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { CountryRepository } from '../country/country.repository';
import { StateRepository } from 'src/state/state.repository';

@Injectable()
export class ActivateCitySeeder extends AbstractSeeder {
  public name = ActivateCitySeeder.name;
  private readonly logger = new Logger(ActivateCitySeeder.name);

  constructor(
    private readonly cityRepository: CityRepository,
    private readonly countryRepository: CountryRepository,
    private readonly stateRepository: StateRepository
  ) {
    super();
  }

  async seed() {
    try {
      // List of cities with their corresponding country names
      const cities = [
        { name: 'Miami', active: true, isDeleted: false },
        { name: 'Dubai', active: true, isDeleted: false },
        { name: 'New York', active: true, isDeleted: false },
        { name: 'London', active: true, isDeleted: false },
        { name: 'Bangkok', active: true, isDeleted: false },
        { name: 'Los Angeles', active: true, isDeleted: false },
        { name: 'Hong Kong', active: true, isDeleted: false },
        { name: 'Singapore', active: true, isDeleted: false },
        { name: 'Paris', active: true, isDeleted: false },
        { name: 'Tokyo', active: true, isDeleted: false },
        { name: 'Sydney', active: true, isDeleted: false },
        { name: 'Toronto', active: true, isDeleted: false },
        { name: 'Istanbul', active: true, isDeleted: false },
        { name: 'Manila', active: true, isDeleted: false },
        { name: 'Kuala Lumpur', active: true, isDeleted: false },
        { name: 'Cape Town', active: true, isDeleted: false },
        { name: 'Melbourne', active: true, isDeleted: false },
        { name: 'Barcelona', active: true, isDeleted: false },
        { name: 'Vienna', active: true, isDeleted: false },
        { name: 'Zurich', active: true, isDeleted: false },
        { name: 'Chicago', active: true, isDeleted: false },
        { name: 'Shanghai', active: true, isDeleted: false },
        { name: 'Beijing', active: true, isDeleted: false },
        { name: 'Bali', active: true, isDeleted: false },
        { name: 'Male', active: true, isDeleted: false },
        { name: 'Rio de Janeiro', active: true, isDeleted: false },
        { name: 'São Paulo', active: true, isDeleted: false },
        { name: 'Marrakech', active: true, isDeleted: false },
        { name: 'Monaco', active: true, isDeleted: false },
        { name: 'Nice', active: true, isDeleted: false },
        { name: 'Lisbon', active: true, isDeleted: false },
        { name: 'Rome', active: true, isDeleted: false },
        { name: 'Milan', active: true, isDeleted: false },
        { name: 'Athens', active: true, isDeleted: false },
        { name: 'Mykonos', active: true, isDeleted: false },
        { name: 'Phuket', active: true, isDeleted: false },
        { name: 'Koh Samui', active: true, isDeleted: false },
        { name: 'Honolulu', active: true, isDeleted: false },
        { name: 'Las Vegas', active: true, isDeleted: false },
        { name: 'San Francisco', active: true, isDeleted: false },
        { name: 'Dallas', active: true, isDeleted: false },
        { name: 'Houston', active: true, isDeleted: false },
        { name: 'Seattle', active: true, isDeleted: false },
        { name: 'Vancouver', active: true, isDeleted: false },
        { name: 'Montreal', active: true, isDeleted: false },
        { name: 'Panama City', active: true, isDeleted: false },
        { name: 'Buenos Aires', active: true, isDeleted: false },
        { name: 'Santiago', active: true, isDeleted: false },
        { name: 'Abu Dhabi', active: true, isDeleted: false },
        { name: 'Doha', active: true, isDeleted: false },
        { name: 'Monte Carlo', active: true, isDeleted: false },
        { name: 'Geneva', active: true, isDeleted: false },
        { name: 'St. Moritz', active: true, isDeleted: false },
        { name: 'Aspen', active: true, isDeleted: false },
        { name: 'Lake Como', active: true, isDeleted: false },
        { name: 'Portofino', active: true, isDeleted: false },
        { name: 'Amalfi', active: true, isDeleted: false },
        { name: 'Bora Bora', active: true, isDeleted: false },
        { name: 'Queenstown', active: true, isDeleted: false },
        { name: 'Auckland', active: true, isDeleted: false },
        { name: 'Johannesburg', active: true, isDeleted: false },
        { name: 'Lagos', active: true, isDeleted: false },
        { name: 'Ho Chi Minh City', active: true, isDeleted: false },
        { name: 'Hanoi', active: true, isDeleted: false },
        { name: 'Seoul', active: true, isDeleted: false },
        { name: 'Taipei', active: true, isDeleted: false },
        { name: 'Macau', active: true, isDeleted: false },
        { name: 'Riyadh', active: true, isDeleted: false },
        { name: 'Muscat', active: true, isDeleted: false },
        { name: 'Mexico City', active: true, isDeleted: false },
        { name: 'Cancun', active: true, isDeleted: false },
        { name: 'Punta Cana', active: true, isDeleted: false },
        { name: 'Nassau', active: true, isDeleted: false },
        { name: 'Montego Bay', active: true, isDeleted: false },
        { name: 'Providenciales', active: true, isDeleted: false },
        { name: 'San Juan', active: true, isDeleted: false },
        { name: 'Cartagena', active: true, isDeleted: false },
        { name: 'Lima', active: true, isDeleted: false },
        { name: 'Santo Domingo', active: true, isDeleted: false },
        { name: 'Medellin', active: true, isDeleted: false }
      ];

      // Seed the cities
      for (const cityData of cities) {
        const city = await this.cityRepository.find({ 
          name: { 
            $regex: `^${cityData.name.replace(/[()]/g, '\\$&')}$`, 
            $options: 'i' 
          },
          isDeleted: false 
        });
  
        if (city) {
          await this.cityRepository.update(city._id.toString(), { active: true });
  
          if (city.stateId) {
            await this.stateRepository.update(city.stateId.toString(), { active: true });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error while seeding cities:', error);
    }
  }
}
