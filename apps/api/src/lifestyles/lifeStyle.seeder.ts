import { Injectable, Logger } from '@nestjs/common';
import { LifeStyleRepository } from './lifeStyle.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class LifeStyleSeeder extends AbstractSeeder {
  public name = LifeStyleSeeder.name;
  private readonly logger = new Logger(LifeStyleSeeder.name);

  constructor(private readonly lifeStyleRepository: LifeStyleRepository) {
    super();
  }

  async seed() {
    try {
      // List of lifestyles to be seeded
      const lifeStyles = [
        { name: 'Newest Branded Residences' },
        { name: 'Investment Opportunities' },
        { name: 'Pet Friendly Residences' },
        { name: 'Beachfront Residences' },
        { name: 'Golf Residences' },
        { name: 'Emerging Markets' },
        { name: 'Best for Couples' },
        { name: 'Ski Resort' },
        { name: 'Cultural Hotspots' },
        { name: 'Best for Families' },
        { name: 'Best for Urban High Rise Luxury' },
        { name: 'Best for Working' },
        { name: 'Retirement Havens' },
        { name: 'Beachfront Branded Residences' },
        { name: 'Urban Luxury Residences' },
        { name: 'Golf Branded Residences' },
        { name: 'Mountain/Resort Residences' },
        { name: 'Eco-Friendly Residences' },
        { name: 'Wellness-Focused Residences' },
        { name: 'Historic/Cultural Residences' },
        { name: 'Ski-In/Ski-Out Residences' },
        { name: 'Family-Friendly Residences' },
        { name: 'Retirement/Active Adult Residences' },
        { name: 'Private Island Residences' },
        { name: 'Yacht Club Residences' },
        { name: 'Equestrian Residences' },
        { name: 'Winery/Vineyard Residences' },
        { name: 'Spa and Wellness Residences' },
        { name: 'Adventure Residences' },
        { name: 'Culinary Residences' },
        { name: 'Art and Culture Residences' },
        { name: 'Smart Tech Residences' },
        { name: 'Green Energy Residences' },
      ];

      // Loop through each lifestyle and upsert it into the repository
      for (const lifeStyle of lifeStyles) {
        await this.lifeStyleRepository.upsert(
          { name: lifeStyle.name }, // Query criteria to check for existing entry
          {
            ...lifeStyle, // Data to insert or update
            isDeleted: false,
          }
        );
      }
    } catch (error) {
      this.logger.error('Error seeding LifeStyles', error);
    }
  }
}
