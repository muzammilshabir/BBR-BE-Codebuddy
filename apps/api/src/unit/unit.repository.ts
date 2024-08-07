import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from './schema/unit.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { AddUnitKeyFeaturesDto } from './dto/unit-key-features.dto';
import { AddVisualsDto } from './dto/add-visuals.dto';

@Injectable()
export class UnitRepository extends BaseRepository<Unit> {
  constructor(@InjectModel(Unit.name) private readonly unitModel: Model<Unit>) {
    super(unitModel);
  }
}
