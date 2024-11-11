import { Injectable, Logger } from '@nestjs/common';
import { AmenityRepository } from './amenities.repository';
import { UploadRepository } from '../upload/upload.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';

@Injectable()
export class AmenitySeeder extends AbstractSeeder {
  public name = AmenitySeeder.name;
  private readonly logger = new Logger(AmenitySeeder.name);

  constructor(
    private readonly amenityRepository: AmenityRepository,
    private readonly uploadRepository: UploadRepository
  ) {
    super();
  }

  async seed() {
    try {
      const amenities = [
        { name: 'Swimming pool', imageFileKey: 'Swimming pool.jpg' },
        { name: 'Private Beach access', imageFileKey: 'Private Beach access.jpg' },
        { name: 'Gym/Fitness center', imageFileKey: 'Gym Fitness center.png' },
        { name: 'Golf course access', imageFileKey: 'Golf course access.png' },
        { name: 'Security Staff', imageFileKey: 'Security Staff.png' },
        { name: 'Marina / Yacht Club', imageFileKey: 'Marina  Yacht Club.png' },
        { name: 'On-site Restaurant / Cafe', imageFileKey: 'On-site Restaurant  Cafe.png' },
        { name: 'Spa / Wellness Center', imageFileKey: 'Spa  Wellness Center.png' },
        { name: 'Concierge Service', imageFileKey: 'Concierge Service.png' },
        { name: 'Parking space / Garage', imageFileKey: 'Parking space  Garage.png' },
        { name: 'Gated Community', imageFileKey: 'Gated Community.png' },
      ];

      for (const amenity of amenities) {
        let upload = null;

        // Find the image in Upload collection based on `originalFileKey`
        if (amenity.imageFileKey) {
          upload = await this.uploadRepository.find({ originalFileKey: amenity.imageFileKey });
        }

        // Set up `upload` field in Amenity document if image was found
        const uploadField = upload ? [{ imageId: upload._id as Types.ObjectId, type: 'logo' }] : [];

        await this.amenityRepository.upsert(
          { name: amenity.name },
          { name: amenity.name, upload: uploadField }
        );
      }
    } catch (error) {
      this.logger.error('Error seeding Amenities', error);
    }
  }
}
