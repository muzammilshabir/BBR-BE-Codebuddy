import { Injectable, Logger } from '@nestjs/common';
import { PropertyTypeRepository } from './propertyType.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class PropertyTypeSeeder extends AbstractSeeder {
  public name = PropertyTypeSeeder.name;
  private readonly logger = new Logger(PropertyTypeSeeder.name);

  constructor(private readonly propertyTypeRepository: PropertyTypeRepository) {
    super();
  }

  async seed() {
    try {
      // List of property types to be seeded
      const propertyTypes = [
        { name: 'Beachfront Branded Residences' },
        { name: 'Urban Luxury Residences' },
        { name: 'Golf Branded Residences' },
        { name: 'Family-Friendly Residences' },
        { name: 'Ski-In/Ski-Out Residences' },
        { name: 'Retirement/Active Adult Residences' },
        { name: 'Mountain/Resort Residences' },
        { name: 'Wellness-Focused Residences' },
        { name: 'Historic/Cultural Residences' },
        { name: 'Private Island Residences' },
        { name: 'Eco-Friendly Residences' },
        { name: 'Spa and Wellness Residences' },
        { name: 'Yacht Club Residences' },
        { name: 'Equestrian Residences' },
        { name: 'Winery/Vineyard Residences' },
        { name: 'Adventure Residences' },
        { name: 'Culinary Residences' },
        { name: 'Art and Culture Residences' },
        { name: 'Smart Tech Residences' },
        { name: 'Green Energy Residences' },
        { name: 'Investment Opportunities' },
        { name: 'Pet-Friendly Residences' },
        { name: 'Emerging Markets' },
        { name: 'Best for Couples' },
        { name: 'Best for Families' },
        { name: 'Best for Urban High-Rise Luxury' },
        { name: 'Best for Working' },
        { name: 'Retirement Havens' },
        { name: 'Newest Branded Residences' },
      ];

      // Loop through each property type and upsert it into the repository
      for (const propertyType of propertyTypes) {
        await this.propertyTypeRepository.upsert(
          { name: propertyType.name },
          {
            ...propertyType,
            isDeleted: false,
          }
        );
      }
    } catch (error) {
      this.logger.error('Error seeding PropertyTypes', error);
    }
  }
}
