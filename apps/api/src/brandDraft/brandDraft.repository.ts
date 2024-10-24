import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandDraft } from './schema/brandDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class BrandDraftRepository extends BaseRepository<BrandDraft> {
  constructor(@InjectModel(BrandDraft.name) private readonly brandDraftModel: Model<BrandDraft>) {
    super(brandDraftModel);
  }
}
