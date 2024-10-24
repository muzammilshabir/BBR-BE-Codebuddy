import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandDraft } from './schema/brandDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class BrandDraftRepository extends BaseRepository<BrandDraft> {
  constructor(@InjectModel(BrandDraft.name) private readonly brandDraftModel: Model<BrandDraft>) {
    super(brandDraftModel);
  }
  async getBrandDraftById(brandDraftId: string) {
    const brandDraft = await this.brandDraftModel.findById(brandDraftId).populate([
      { path: 'brandCategoryId', model: 'BrandCategory' },
      { path: 'brandId', model: 'Brand' },
      {
        path: 'upload.ImageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
    ]);

    if (!brandDraft) {
      throw new NotFoundException(`Brand draft with id ${brandDraftId}`);
    }

    return brandDraft;
  }
}
