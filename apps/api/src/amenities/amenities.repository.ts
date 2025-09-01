import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity } from './schema/amenities.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class AmenityRepository extends (BaseRepository as any)<Amenity> {
  constructor(@InjectModel(Amenity.name) private readonly amenityModel: Model<Amenity>) {
    super(amenityModel);
  }
}