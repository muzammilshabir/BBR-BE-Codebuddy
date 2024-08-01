import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity } from './schema/amenities.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class AmenityFixture extends AbstractFixture {
  constructor(@InjectModel(Amenity.name) private readonly amenityModel: Model<Amenity>) {
    super();
  }

  name = AmenityFixture.name;
  static TAG_SWIMMING_POOL = 'TAG_SWIMMING_POOL';
  static TAG_PRIVATE_BEACH_ACCESS = 'TAG_PRIVATE_BEACH_ACCESS';
  static TAG_GYM = 'TAG_GYM';
  static TAG_GOLF_COURSE = 'TAG_GOLF_COURSE';

  async load(): Promise<void> {
    const swimmingPool = await this.amenityModel.create({ name: 'Swimming pool' });
    const privateBeachAccess = await this.amenityModel.create({ name: 'Private Beach access' });
    const gym = await this.amenityModel.create({ name: 'Gym/Fitness center' });
    const golfCourse = await this.amenityModel.create({ name: 'Golf course access' });

    this.addReference(AmenityFixture.TAG_SWIMMING_POOL, swimmingPool);
    this.addReference(AmenityFixture.TAG_PRIVATE_BEACH_ACCESS, privateBeachAccess);
    this.addReference(AmenityFixture.TAG_GYM, gym);
    this.addReference(AmenityFixture.TAG_GOLF_COURSE, golfCourse);
  }
}
