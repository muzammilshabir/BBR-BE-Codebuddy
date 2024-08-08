import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from './schema/unit.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class UnitRepository extends BaseRepository<Unit> {
  constructor(@InjectModel(Unit.name) private readonly unitModel: Model<Unit>) {
    super(unitModel);
  }

  async findById(unitId: string): Promise<Unit> {
    return this.unitModel
      .findById(unitId)
      .populate([
        { path: 'residenceId' },
        { path: 'visuals.mainGalleryPhotos', model: 'Upload' },
        { path: 'visuals.secondGalleryPhotos', model: 'Upload' },
        { path: 'visuals.videoTour', model: 'Upload' },
        { path: 'createdById', model: 'User' },
      ])
      .exec();
  }
}
