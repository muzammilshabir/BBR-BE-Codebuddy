import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { RoomTypeRepository } from './roomType.repository';

@Injectable()
export class RoomTypeSeeder extends AbstractSeeder {
  public name = RoomTypeSeeder.name;
  private readonly logger = new Logger(RoomTypeSeeder.name);

  constructor(private readonly roomTypeRepository: RoomTypeRepository) {
    super();
  }

  async seed() {
    try {
      const roomTypes = [
        { type: 'Bedroom' },
        { type: 'Bathroom' },
        { type: 'Working Cabinet' },
        { type: 'Living Room' },
        { type: 'Kitchen Studio' },
        { type: 'Gym' },
        { type: 'Parking Place' },
      ];

      for (const roomType of roomTypes) {
        await this.roomTypeRepository.upsert(
          { type: roomType.type },
          {
            ...roomType,
            isDeleted: false,
          }
        );
      }
    } catch (error) {
      this.logger.error('Error while seeding room types:', error);
    }
  }
}
