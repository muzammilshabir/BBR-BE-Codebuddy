import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { RoomTypeRepository } from './roomType.repository';
import { UploadRepository } from '../upload/upload.repository';
import { Types } from 'mongoose';

@Injectable()
export class RoomTypeSeeder extends AbstractSeeder {
  public name = RoomTypeSeeder.name;
  private readonly logger = new Logger(RoomTypeSeeder.name);

  constructor(
    private readonly roomTypeRepository: RoomTypeRepository,
    private readonly uploadRepository: UploadRepository
  ) {
    super();
  }

  async seed() {
    try {
      const roomTypes = [
        { type: 'Bedroom', imageFileKey: 'Bedroom.jpg' },
        { type: 'Bathroom', imageFileKey: 'Bathroom.jpg' },
        { type: 'Working Cabinet', imageFileKey: 'Working Cabinet.jpg' },
        { type: 'Living Room', imageFileKey: 'Living Room.jpg' },
        { type: 'Kitchen Studio', imageFileKey: 'Kitchen Studio.jpg' },
        { type: 'Gym', imageFileKey: 'Gym.jpg' },
        { type: 'Parking Place', imageFileKey: 'Parking Place.jpg' },
        { type: 'Wardrobe', imageFileKey: 'Wardrobe.jpg' },
      ];

      for (const roomType of roomTypes) {
        let upload = null;

        // Find the image in Upload collection based on `originalFileKey`
        if (roomType.imageFileKey) {
          upload = await this.uploadRepository.find({ originalFileKey: roomType.imageFileKey });
        }

        // Set up `upload` field in RoomType document if image was found
        const uploadField = upload ? [{ ImageId: upload._id as Types.ObjectId, type: 'logo' }] : [];

        await this.roomTypeRepository.upsert(
          { type: roomType.type },
          { type: roomType.type, upload: uploadField, isDeleted: false }
        );
      }
    } catch (error) {
      this.logger.error('Error while seeding room types:', error);
    }
  }
}
