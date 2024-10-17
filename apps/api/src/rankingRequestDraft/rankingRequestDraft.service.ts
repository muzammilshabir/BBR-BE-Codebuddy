import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RankingRequestDraftRepository } from './rankingRequestDraft.repository';
import { ListRankingRequestDraftDto } from './dto/listRankingRequestDraft.dto';
import { Types } from 'mongoose';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingRequestRepository } from '../rankingRequest/rankingRequest.repository';
import { RankingRequestStatus } from '../rankingRequest/enum/rankingRequest-status.enum';
import { RankingRequest } from '../rankingRequest/schema/rankingRequest.schema';
import { RankingRequestDraft } from './schema/rankingRequestDraft.schema';

@Injectable()
export class RankingRequestDraftService {
  constructor(
    private readonly rankingRequestDraftRepository: RankingRequestDraftRepository,
    private readonly rankingRequestRepository: RankingRequestRepository
  ) {}

  async listRankingRequestDraft(listRankingRequestDraftDto: ListRankingRequestDraftDto) {
    const filter: any = {};
    if (listRankingRequestDraftDto.status) {
      filter.status = listRankingRequestDraftDto.status;
    }

    if (listRankingRequestDraftDto.paymentStatus) {
      filter.paymentStatus = listRankingRequestDraftDto.paymentStatus;
    }

    if (listRankingRequestDraftDto.search) {
      filter.$or = [{ name: { $regex: listRankingRequestDraftDto.search, $options: 'i' } }];
    }

    const options = PaginationService.prepareOptions(listRankingRequestDraftDto);

    const { data, count } = await this.rankingRequestDraftRepository.findAll(filter, options, [
      { path: 'residenceId' },
      { path: 'rankingCategoryId' },
      { path: 'developerId', model: 'User', select: 'fullName email role' },
    ]);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listRankingRequestDraftDto
    );

    return { pagination, rankingRequestDraft: data };
  }

  async getRankingRequestDraftById(rankingRequestDraftId: string): Promise<any> {
    const rankingRequestDraftDetails =
      await this.rankingRequestDraftRepository.findByIdInDetail(rankingRequestDraftId);
    return rankingRequestDraftDetails;
  }

  async createApprovalRequest(rankingRequestId: string, userId: string): Promise<any> {
    try {
      const rankingRequest = await this.rankingRequestRepository.findById(rankingRequestId);
      if (!rankingRequest) {
        throw new NotFoundException(`Ranking Request with ID ${rankingRequestId} not found`);
      }
      const rankingRequestDraft = await this.rankingRequestDraftRepository.find({
        rankingRequestId: new Types.ObjectId(rankingRequestId),
        status: RankingRequestStatus.DRAFT,
      });
      if (!rankingRequestDraft) {
        throw new NotFoundException(
          `Ranking Request draft request with Ranking request id ${rankingRequestId} and status ${RankingRequestStatus.DRAFT}`
        );
      }

      if (rankingRequest.status === RankingRequestStatus.REJECTED) {
        const isRankingRequestChanged = this.compareChanges(rankingRequest, rankingRequestDraft);

        if (!isRankingRequestChanged) {
          throw new BadRequestException(`No change found in ranking request draft`);
        }
        const pendingRankingRequestDraft = await this.markAsPending(rankingRequestDraft.id, userId);
        await this.rankingRequestRepository.update(rankingRequestId, {
          status: RankingRequestStatus.PENDING,
          updatedById: new Types.ObjectId(userId),
        });

        return { rankingRequestDraft: pendingRankingRequestDraft };
      }

      if (rankingRequest.status === RankingRequestStatus.DRAFT) {
        return await this.handleFirstTimeApproval(rankingRequestDraft, rankingRequestId, userId);
      }

      if (rankingRequest.status === RankingRequestStatus.ACTIVE) {
        const isRankingRequestChanged = this.compareChanges(rankingRequest, rankingRequestDraft);

        if (isRankingRequestChanged) {
          const pendingRankingRequestDraft = await this.markAsPending(
            rankingRequestDraft.id,
            userId
          );

          return { rankingRequestDraft: pendingRankingRequestDraft };
        } else {
          const activeRankingRequestDraft = await this.rankingRequestDraftRepository.update(
            rankingRequestDraft.id,
            {
              status: RankingRequestStatus.ACTIVE,
              updatedById: new Types.ObjectId(userId),
            }
          );

          const plainUpdatedDrafRequest = activeRankingRequestDraft.toJSON();
          delete plainUpdatedDrafRequest.rankingCategoryId;
          delete plainUpdatedDrafRequest._id;

          await this.rankingRequestRepository.update(rankingRequestId, {
            ...plainUpdatedDrafRequest,
          });
          return { rankingRequestDraft: activeRankingRequestDraft };
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating approval request for the ranking category',
        error
      );
    }
  }

  private async handleFirstTimeApproval(
    rankingRequestDraft: any,
    rankingRequestId: string,
    userId: string
  ) {
    const pendingRankingRequestDraft = await this.markAsPending(rankingRequestDraft.id, userId);
    await this.rankingRequestRepository.update(rankingRequestId, {
      status: RankingRequestStatus.PENDING,
      updatedById: new Types.ObjectId(userId),
    });

    return { rankingRequestDraft: pendingRankingRequestDraft };
  }

  private async markAsPending(rankingRequestDraftId: string, userId: string) {
    return await this.rankingRequestDraftRepository.update(rankingRequestDraftId, {
      status: RankingRequestStatus.PENDING,
      updatedById: new Types.ObjectId(userId),
    });
  }

  private compareChanges(
    rankingRequest: RankingRequest,
    rankingRequestDraft: RankingRequestDraft
  ): boolean {
    if (rankingRequest.criteriaScores.length !== rankingRequestDraft.criteriaScores.length) {
      return true;
    }
    for (let i = 0; i < rankingRequest.criteriaScores.length; i++) {
      const categoryScore = rankingRequest.criteriaScores[i];
      const draftScore = rankingRequestDraft.criteriaScores[i];

      if (
        !categoryScore.criteriaId.equals(draftScore.criteriaId) ||
        categoryScore.score !== draftScore.score
      ) {
        return true;
      }
    }

    if (rankingRequest.bbrScore !== rankingRequestDraft.bbrScore) {
      return true;
    }

    if (rankingRequest.status !== rankingRequestDraft.status) {
      return true;
    }

    if (rankingRequest.paymentStatus !== rankingRequestDraft.paymentStatus) {
      return true;
    }

    if (rankingRequest.rankingImprovementOption !== rankingRequestDraft.rankingImprovementOption) {
      return true;
    }

    if (!rankingRequest.residenceId.equals(rankingRequestDraft.residenceId)) {
      return true;
    }

    if (!this.deepCompare(rankingRequest.upload, rankingRequest.upload)) {
      return true;
    }

    if (JSON.stringify(rankingRequest.criteria) !== JSON.stringify(rankingRequestDraft.criteria)) {
      return true;
    }

    return false;
  }

  private deepCompare(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((value, index) => this.deepCompare(value, obj2[index]));
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || !this.deepCompare(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }
}
