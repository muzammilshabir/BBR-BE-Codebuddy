import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from './schema/location.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class LocationRepository extends BaseRepository<Location> {
  constructor(@InjectModel(Location.name) private readonly locationModel: Model<Location>) {
    super(locationModel);
  }
}