import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from './schema/unit.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { AddUnitKeyFeaturesDto } from './dto/unit-key-features.dto';

@Injectable()
export class UnitRepository extends BaseRepository<Unit> {
  constructor(@InjectModel(Unit.name) private readonly unitModel: Model<Unit>) {
    super(unitModel);
  }
  async addUnitKeyFeatures(unitKeyFeaturesDto: AddUnitKeyFeaturesDto, id: string): Promise<Unit> {
    return await this.unitModel.findByIdAndUpdate(
      id,
      { $set: { unitKeyFeatures: { ...unitKeyFeaturesDto } } },
      { new: true }
    );
  }
}
