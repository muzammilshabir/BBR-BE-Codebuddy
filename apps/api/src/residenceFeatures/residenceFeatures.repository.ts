import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceFeature } from './schema/residenceFeatures.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceFeatureRepository extends BaseRepository<ResidenceFeature> {
  constructor(
    @InjectModel(ResidenceFeature.name)
    private readonly residenceFeatureModel: Model<ResidenceFeature>
  ) {
    super(residenceFeatureModel);
  }
}
