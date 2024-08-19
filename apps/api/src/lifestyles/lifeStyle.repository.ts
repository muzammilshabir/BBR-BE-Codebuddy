import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LifeStyle } from './schema/lifeStyle.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class LifeStyleRepository extends BaseRepository<LifeStyle> {
  constructor(@InjectModel(LifeStyle.name) private readonly lifeStyleModel: Model<LifeStyle>) {
    super(lifeStyleModel);
  }
}
