import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { ResidenceTypeRepository } from './residenceType.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class ResidenceTypeSeeder extends AbstractSeeder {
  public name = ResidenceTypeSeeder.name;
  private readonly logger = new Logger(ResidenceTypeSeeder.name);

  constructor(
    private readonly residenceTypeRepository: ResidenceTypeRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super();
  }

  async seed() {
    try {
      // Ensure the MongoDB connection is established
      if (this.connection.readyState !== 1) {
        await this.connection.openUri(process.env.DB_URI);  // Use the appropriate URI for your environment
      }

      const residenceTypes = [
        { type: 'Condo' },
        { type: 'Villa' },
        { type: 'Penthouse' },
      ];

      for (const type of residenceTypes) {
        await this.residenceTypeRepository.create(type);
      }

    } catch (error) {
      this.logger.error('Error while seeding residence types:', error);
    }
  }
}