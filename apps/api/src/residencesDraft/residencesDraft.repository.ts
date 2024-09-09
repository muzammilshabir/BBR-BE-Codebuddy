import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceDraft } from './schema/residencesDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceDraftRepository extends BaseRepository<ResidenceDraft> {
  constructor(
    @InjectModel(ResidenceDraft.name) private readonly ResidenceDraftModel: Model<ResidenceDraft>
  ) {
    super(ResidenceDraftModel);
  }
}
