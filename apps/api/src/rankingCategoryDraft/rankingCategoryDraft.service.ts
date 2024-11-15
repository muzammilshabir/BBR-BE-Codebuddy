import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RankingCategoryDraftRepository } from './rankingCategoryDraft.repository';
import { ListRankingCategoryDraftDto } from './dto/listRankingCategoryDraft.dto';
import { Types } from 'mongoose';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingCategoryRepository } from '../rankingCategory/rankingCategory.repository';
import { RankingCategoryStatus } from '../rankingCategory/enum/rankingCategory-status.enum';

@Injectable()
export class RankingCategoryDraftService {
  constructor(
    private readonly rankingCategoryDraftRepository: RankingCategoryDraftRepository,
    private readonly rankingCategoryRepository: RankingCategoryRepository
  ) {}

  async listRankingCategoryDraft(listRankingCategoryDraftDto: ListRankingCategoryDraftDto) {
    const filter: any = {};
    if (listRankingCategoryDraftDto.status) {
      filter.status = listRankingCategoryDraftDto.status;
    }

    if (listRankingCategoryDraftDto.search) {
      filter.$or = [{ name: { $regex: listRankingCategoryDraftDto.search, $options: 'i' } }];
    }

    const options = PaginationService.prepareOptions(listRankingCategoryDraftDto);

    const { data, count } = await this.rankingCategoryDraftRepository.findAll(filter, options, [
      {
        path: 'createdById',
        select: 'name email',
        model: 'User',
      },
    ]);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listRankingCategoryDraftDto
    );

    return { pagination, rankingCategoryDraft: data };
  }

  async getRankingCategoryDraftById(rankingCategoryDraftId: string): Promise<any> {
    const rankingCategoryDraftDetails =
      await this.rankingCategoryDraftRepository.findByIdInDetail(rankingCategoryDraftId);
    return rankingCategoryDraftDetails;
  }

  async createApprovalRequest(rankingCategoryId: string, userId: string): Promise<any> {
    try {
      const rankingCategory = await this.rankingCategoryRepository.findById(rankingCategoryId);
      if (!rankingCategory) {
        throw new NotFoundException(`Ranking Category with ID ${rankingCategoryId} not found`);
      }
      if (rankingCategory.status === RankingCategoryStatus.REJECTED) {
        throw new BadRequestException(`Rejected Ranking Category Status cannot be updated`);
      }

      const rankingCategoryDraft = await this.rankingCategoryDraftRepository.find({
        rankingCategoryId: new Types.ObjectId(rankingCategoryId),
        status: RankingCategoryStatus.DRAFT,
      });
      if (!rankingCategoryDraft) {
        throw new NotFoundException(
          `Ranking Category draft request with Ranking Category id ${rankingCategoryId} and status ${RankingCategoryStatus.DRAFT}`
        );
      }

      if (rankingCategory.status === RankingCategoryStatus.DRAFT) {
        return await this.handleFirstTimeApproval(rankingCategoryDraft, rankingCategoryId, userId);
      }

      if (rankingCategory.status === RankingCategoryStatus.ACTIVE) {
        const isRankingCategoryChanged = this.compareChanges(rankingCategory, rankingCategoryDraft);

        if (isRankingCategoryChanged) {
          const pendingRankingCategoryDraft = await this.markAsPending(
            rankingCategoryDraft.id,
            userId
          );

          return { rankingCategoryDraft: pendingRankingCategoryDraft };
        } else {
          const activeRankingCategoryDraft = await this.rankingCategoryDraftRepository.update(
            rankingCategoryDraft.id,
            {
              status: RankingCategoryStatus.ACTIVE,
              updatedById: new Types.ObjectId(userId),
            }
          );

          const plainUpdatedDrafRequest = activeRankingCategoryDraft.toJSON();
          delete plainUpdatedDrafRequest.rankingCategoryId;
          delete plainUpdatedDrafRequest._id;

          await this.rankingCategoryRepository.update(rankingCategoryId, {
            ...plainUpdatedDrafRequest,
          });
          return { rankingCategoryDraft: activeRankingCategoryDraft };
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
    rankingCategoryDraft: any,
    rankingCategoryId: string,
    userId: string
  ) {
    const pendingRankingCategoryDraft = await this.markAsPending(rankingCategoryDraft.id, userId);
    await this.rankingCategoryRepository.update(rankingCategoryId, {
      status: RankingCategoryStatus.PENDING,
      updatedById: new Types.ObjectId(userId),
    });

    return { rankingCategoryDraft: pendingRankingCategoryDraft };
  }

  private async markAsPending(rankingCategoryDraftId: string, userId: string) {
    return await this.rankingCategoryDraftRepository.update(rankingCategoryDraftId, {
      status: RankingCategoryStatus.PENDING,
      updatedById: new Types.ObjectId(userId),
    });
  }

  private compareChanges(rankingCategory: any, rankingCategoryDraft: any): boolean {
    if (rankingCategory.title !== rankingCategoryDraft.title) {
      return true;
    }

    if (rankingCategory.categoryType !== rankingCategoryDraft.categoryType) {
      return true;
    }

    if (rankingCategory.price !== rankingCategoryDraft.price) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.countryId?._id, rankingCategoryDraft.countryId)) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.cityId?._id, rankingCategoryDraft.cityId)) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.locationId?._id, rankingCategoryDraft.locationId)) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.propertyTypeId?._id, rankingCategoryDraft.propertyTypeId)) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.geoGraphyId?._id, rankingCategoryDraft.geoGraphyId)) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.lifeStyleId?._id, rankingCategoryDraft.lifeStyleId)) {
      return true;
    }

    if (!this.compareObjectIds(rankingCategory.brandId?._id, rankingCategoryDraft.brandId)) {
      return true;
    }

    if (rankingCategory.description !== rankingCategoryDraft.description) {
      return true;
    }

    if (!this.deepCompare(rankingCategory.criteria.toObject(), rankingCategoryDraft.criteria.toObject())) {
      return true;
    }

    if (rankingCategory.residenceLimitation !== rankingCategoryDraft.residenceLimitation) {
      return true;
    }

    if (!this.deepCompare(rankingCategory.upload.toObject(), rankingCategoryDraft.upload.toObject())) {
      return true;
    }

    if (rankingCategory.rejectionReason !== rankingCategoryDraft.rejectionReason) {
      return true;
    }

    return false;
  }

  private compareObjectIds(id1: any, id2: any): boolean {
    if (!id1 && !id2) return true;
    if (!id1 || !id2) return false;
    return id1.toString() === id2.toString();
  }

  private deepCompare(obj1: any, obj2: any): boolean {
    // Properties to exclude from comparison
    const excludedProps = ['_id', 'createdAt', 'updatedAt'];

    if (obj1 === obj2) return true;

    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((value, index) => this.deepCompare(value, obj2[index]));
    }

    const keys1 = Object.keys(obj1).filter(key => !excludedProps.includes(key));
    const keys2 = Object.keys(obj2).filter(key => !excludedProps.includes(key));
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || !this.deepCompare(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }
}
