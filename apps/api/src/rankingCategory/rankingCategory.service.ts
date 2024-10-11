import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingCategoryRepository } from './rankingCategory.repository';
import { CreateRankingCategoryDto } from './dto/create-ranking-category.dto';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RankingCategory } from './schema/rankingCategory.schema';
import { RankingCategoryStatus } from './enum/rankingCategory-status.enum';
import {
  UpdateRankingCategoryDto,
  UpdateRankingCategoryStatusDto,
} from './dto/update-ranking-category.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { RankingCategoryListDto } from './dto/list-ranking-category.dto';
import { RejectRankingCategoryDto } from './dto/reject-ranking-category.dto';
import { RankingCategoryDraftRepository } from '../rankingCategoryDraft/rankingCategoryDraft.repository';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';

@Injectable()
export class RankingCategoryService {
  constructor(
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly rankingCategoryDraftRepository: RankingCategoryDraftRepository
  ) {}

  async findAll(rankingCategoryDto: RankingCategoryListDto, user: JwtPayloadType) {
    const { search, status, limit, page } = rankingCategoryDto;

    const query: any = {
      isDeleted: { $ne: DeletionStatus.DELETED },
      createdById: new Types.ObjectId(user.sub),
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    return await this.rankingCategoryRepository.findAll(query, rankingCategoryDto, [
      {
        path: 'createdById',
        select: 'name email',
        model: 'User',
      },
    ]);
  }

  async create(
    createResidenceDto: CreateRankingCategoryDto,
    user: JwtPayloadType
  ): Promise<RankingCategory> {
    const transformedDto: any = {
      ...createResidenceDto,
      createdById: new Types.ObjectId(user.sub),
      upload: createResidenceDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
    };

    const rankingCategory = await this.rankingCategoryRepository.create(transformedDto);

    await this.rankingCategoryDraftRepository.create({
      ...transformedDto,
      rankingCategoryId: new Types.ObjectId(rankingCategory.id),
    });

    return rankingCategory;
  }

  async update(
    rankingCategoryId: string,
    user: JwtPayloadType,
    updateRankingCategoryDto: UpdateRankingCategoryDto
  ): Promise<RankingCategory> {
    const rankingCategory = await this.findRankingCategoryById(rankingCategoryId);
    if (rankingCategory.createdById._id.toString() !== user.sub) {
      throw new ForbiddenException('You do not have permission to update this RankingCategory');
    }

    const transformedDto = {
      ...updateRankingCategoryDto,
      upload: updateRankingCategoryDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
      updatedById: new Types.ObjectId(user.sub),
    };

    const rankingCategoryDraft = await this.checkRankingCategoryDraft(rankingCategoryId);
    if (rankingCategoryDraft) {
      return await this.rankingCategoryDraftRepository.update(
        rankingCategoryDraft.id,
        transformedDto
      );
    }

    return await this.rankingCategoryDraftRepository.create({
      ...transformedDto,
      rankingCategoryId: new Types.ObjectId(rankingCategoryId),
    });
  }

  async findRankingCategoryById(id: string): Promise<RankingCategory> {
    const rankingCategory = await this.rankingCategoryRepository.findById(id);
    if (!rankingCategory) {
      throw new NotFoundException(`Ranking category with ID ${id}`);
    }
    return rankingCategory;
  }

  async checkRankingCategoryDraft(rankingCategoryId: string) {
    return await this.rankingCategoryDraftRepository.find({
      rankingCategoryId: new Types.ObjectId(rankingCategoryId),
      status: { $in: [RankingCategoryStatus.DRAFT, RankingCategoryStatus.PENDING] },
    });
  }

  async findRankingCategory(id: string, user: JwtPayloadType): Promise<RankingCategory> {
    const rankingCategory = await this.findRankingCategoryById(id);
    if (!rankingCategory) {
      throw new NotFoundException(`Residence with ID ${id}`);
    }
    if (rankingCategory.createdById._id.toString() !== user.sub) {
      throw new ForbiddenException('You do not have permission to delete this RankingCategory');
    }
    return rankingCategory;
  }

  async approveRankingCategory(rankingCategoryId: string, userId: string) {
    try {
      await this.checkRankingCategoryRejectedStatus(rankingCategoryId);

      const rankingCategoryDraft = await this.checkRankingCategoryDraft(rankingCategoryId);
      if (!rankingCategoryDraft) {
        throw new BadRequestException(
          `Not found pending Ranking category Draft Request with rankingCategoryId ${rankingCategoryId}`
        );
      }
      const draftRequestId = rankingCategoryDraft.id.toString();

      const updatedRankingCategoryDraftRequest = await this.rankingCategoryDraftRepository.update(
        draftRequestId,
        {
          status: RankingCategoryStatus.ACTIVE,
          updatedById: new Types.ObjectId(userId),
        }
      );

      const plainUpdatedDrafRequest = updatedRankingCategoryDraftRequest.toJSON();
      delete plainUpdatedDrafRequest.residenceId;
      delete plainUpdatedDrafRequest._id;

      await this.rankingCategoryRepository.update(rankingCategoryId, {
        ...plainUpdatedDrafRequest,
      });

      return updatedRankingCategoryDraftRequest;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while approving the ranking category',
        error
      );
    }
  }

  async checkRankingCategoryRejectedStatus(rankingCategoryId: string) {
    const rankingCategory = await this.rankingCategoryRepository.findById(rankingCategoryId);
    if (!rankingCategory) {
      throw new NotFoundException(`Ranking Category with ID ${rankingCategoryId}`);
    }
    if (rankingCategory.status === RankingCategoryStatus.REJECTED) {
      throw new BadRequestException(`Rejected  Ranking Category cannot be updated`);
    }
  }

  async rejectRankingCategory(
    rankingCategoryId: string,
    userId: string,
    rejectRankingCategoryDto: RejectRankingCategoryDto
  ) {
    await this.checkRankingCategoryRejectedStatus(rankingCategoryId);

    const rankingCategoryDraft = await this.checkRankingCategoryDraft(rankingCategoryId);
    if (!rankingCategoryDraft) {
      throw new BadRequestException(
        `Not found pending Ranking category Draft Request with rankingCategoryId ${rankingCategoryId}`
      );
    }

    const updatedRankingCategoryDraftRequest = await this.rankingCategoryDraftRepository.update(
      rankingCategoryDraft.id,
      {
        status: RankingCategoryStatus.REJECTED,
        rejectionReason: rejectRankingCategoryDto.reason,
        updatedById: new Types.ObjectId(userId),
      }
    );

    const rankingCategory = await this.findRankingCategoryById(rankingCategoryId);

    if (
      rankingCategory.status === RankingCategoryStatus.PENDING ||
      rankingCategory.status === RankingCategoryStatus.DRAFT
    ) {
      await this.rankingCategoryRepository.update(rankingCategoryId, {
        status: RankingCategoryStatus.REJECTED,
        rejectionReason: rejectRankingCategoryDto.reason,
        updatedById: new Types.ObjectId(userId),
      });
    }

    return updatedRankingCategoryDraftRequest;
  }

  async updateRankingCategoryStatus(
    rankingCategoryId: string,
    userId: string,
    updateRankingCategoryStatusDto: UpdateRankingCategoryStatusDto
  ) {
    const rankingCategory = await this.findRankingCategoryById(rankingCategoryId);

    if (!rankingCategory) {
      throw new NotFoundException(`Ranking Category with ID ${rankingCategoryId} not found`);
    }

    if (
      [
        RankingCategoryStatus.DRAFT,
        RankingCategoryStatus.REJECTED,
        RankingCategoryStatus.ACTIVE,
      ].includes(updateRankingCategoryStatusDto.status)
    ) {
      throw new BadRequestException(
        `Cannot update Ranking category with status: ${updateRankingCategoryStatusDto.status}`
      );
    }
    const updatePayload: any = {
      status: updateRankingCategoryStatusDto.status,
      updatedById: new Types.ObjectId(userId),
    };

    if (updateRankingCategoryStatusDto.status === RankingCategoryStatus.DELETED) {
      updatePayload.isDeleted = DeletionStatus.DELETED;
    }

    const updatedResidence = await this.rankingCategoryRepository.update(
      rankingCategoryId,
      updatePayload
    );

    return updatedResidence;
  }

  async unarchiveRankingCategory(rankingCategoryId: string, userId: string): Promise<any> {
    const rankingCategory = await this.rankingCategoryRepository.find({
      _id: new Types.ObjectId(rankingCategoryId),
      status: RankingCategoryStatus.ARCHIVED,
    });

    if (!rankingCategory) {
      throw new NotFoundException(
        `Ranking category with ID ${rankingCategoryId} with status: ${RankingCategoryStatus.ARCHIVED} not found`
      );
    }

    const updatedResidence = await this.rankingCategoryRepository.update(rankingCategoryId, {
      status: RankingCategoryStatus.DRAFT,
      updatedById: new Types.ObjectId(userId),
    });

    return updatedResidence;
  }

  async listResidencesWithDraft(rankingCategoryListDto: RankingCategoryListDto) {
    const result =
      await this.rankingCategoryRepository.listRankingCategoriesWithDraft(rankingCategoryListDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      rankingCategoryListDto
    );

    return { pagination, rankingCategory: data };
  }
}
