import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceService } from './schema/residenceService.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceServiceRepository extends BaseRepository<ResidenceService> {
  constructor(
    @InjectModel(ResidenceService.name)
    private readonly residenceServiceModel: Model<ResidenceService>
  ) {
    super(residenceServiceModel);
  }
}
