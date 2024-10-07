import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { RankingCategory } from './schema/rankingCategory.schema';
import { DeletionStatus } from '../unit/enum/unit-enum';

@Injectable()
export class RankingCategoryRepository extends BaseRepository<RankingCategory> {
  constructor(
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {
    super(rankingCategoryModel);
  }

  async findById(id: string): Promise<RankingCategory> {
    return this.rankingCategoryModel
      .findOne({ _id: id, isDeleted: { $ne: DeletionStatus.DELETED } })
      .populate('createdById', 'name email')
      .populate({
        path: 'upload.ImageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      })
      .populate({
        path: 'lifeStyleSubCategoryId',
        select: 'name description',
        model: 'LifeStyle',
      })
      .populate({
        path: 'propertyTypeSubCategoryId',
        select: 'name',
        model: 'PropertyType',
      });
  }
}
