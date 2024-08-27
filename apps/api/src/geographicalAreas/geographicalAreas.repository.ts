import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GeographicalAreas } from './schema/geographicalAreas.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class GeographicalAreasRepository extends BaseRepository<GeographicalAreas> {
  constructor(
    @InjectModel(GeographicalAreas.name)
    private readonly geographicalAreasModel: Model<GeographicalAreas>
  ) {
    super(geographicalAreasModel);
  }
}
