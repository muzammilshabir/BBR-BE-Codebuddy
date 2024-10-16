import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingCategoryDraft } from './schema/rankingCategoryDraft.schema';

@Injectable()
export class RankingCategoryDraftRepository extends BaseRepository<RankingCategoryDraft> {
  constructor(
    @InjectModel(RankingCategoryDraft.name)
    private readonly rankingCategoryDraftModel: Model<RankingCategoryDraft>
  ) {
    super(rankingCategoryDraftModel);
  }
  async findByIdInDetail(rankingCategoryDraftId: string): Promise<any> {
    const rankingCategoryDraft: any = await this.rankingCategoryDraftModel
      .findById(rankingCategoryDraftId)
      .populate({
        path: 'upload.ImageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      })
      .populate({ path: 'createdById', model: 'User', select: 'fullName email role' });

    if (!rankingCategoryDraft) {
      throw new NotFoundException(`rankingCategoryDraft with ID ${rankingCategoryDraft}`);
    }

    return rankingCategoryDraft;
  }
}
