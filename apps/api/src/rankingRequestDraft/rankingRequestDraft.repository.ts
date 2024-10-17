import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingRequestDraft } from './schema/rankingRequestDraft.schema';

@Injectable()
export class RankingRequestDraftRepository extends BaseRepository<RankingRequestDraft> {
  constructor(
    @InjectModel(RankingRequestDraft.name)
    private readonly rankingRequestDraftModel: Model<RankingRequestDraft>
  ) {
    super(rankingRequestDraftModel);
  }
  async findByIdInDetail(rankingRequestDraftId: string): Promise<any> {
    const rankingRequestDraft: any = await this.rankingRequestDraftModel
      .findById(rankingRequestDraftId)
      .populate([
        { path: 'residenceId' },
        { path: 'rankingCategoryId' },
        { path: 'developerId', model: 'User', select: 'fullName email role' },
        {
          path: 'upload.ImageId',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
      ]);
    if (!rankingRequestDraft) {
      throw new NotFoundException(`rankingRequestDraft with ID ${rankingRequestDraft}`);
    }

    return rankingRequestDraft;
  }
}
