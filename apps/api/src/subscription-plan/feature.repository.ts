import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Feature } from './schema/feature.schema';

@Injectable()
export class FeatureRepository extends BaseRepository<Feature> {
  constructor(@InjectModel(Feature.name) private readonly featureModel: Model<Feature>) {
    super(featureModel);
  }
}
