import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { DeletionStatus } from '../unit/enum/unit-enum';

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<Brand>) {
    super(brandModel);
  }

  async getBrandById(brandDraftId: string) {
    const brandDraft = await this.brandModel
      .findOne({
        _id: new Types.ObjectId(brandDraftId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      })
      .populate([
        { path: 'brandCategoryId', model: 'BrandCategory' },
        {
          path: 'upload.ImageId',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
      ]);

    if (!brandDraft) {
      throw new NotFoundException(`Brand with id ${brandDraftId}`);
    }

    return brandDraft;
  }
}
