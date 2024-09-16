import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnitDraft } from './schema/unitDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class UnitDraftRepository extends BaseRepository<UnitDraft> {
  constructor(@InjectModel(UnitDraft.name) private readonly unitDraftModel: Model<UnitDraft>) {
    super(unitDraftModel);
  }
}
