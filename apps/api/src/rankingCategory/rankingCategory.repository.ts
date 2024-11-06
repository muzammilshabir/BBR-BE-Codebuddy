import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { RankingCategory } from './schema/rankingCategory.schema';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { RankingCategoryListDto } from './dto/list-ranking-category.dto';
import { RankingRequestStatus } from '../rankingRequest/enum/rankingRequest-status.enum';

@Injectable()
export class RankingCategoryRepository extends BaseRepository<RankingCategory> {
  constructor(
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {
    super(rankingCategoryModel);
  }

  async findById(id: string): Promise<RankingCategory | null> {
    const rankingCategory = await this.rankingCategoryModel
      .findOne({ _id: id, isDeleted: { $ne: DeletionStatus.DELETED } })
      .populate('createdById', 'fullName email role')
      .populate({
        path: 'upload.ImageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      })
      .populate({
        path: 'countryId',
        select: 'name code',
        model: 'Country',
      })
      .populate({
        path: 'cityId',
        select: 'name state',
        model: 'City',
      })
      .populate({
        path: 'locationId',
        select: 'name coordinates',
        model: 'Location',
      })
      .populate({
        path: 'propertyTypeId',
        select: 'type description',
        model: 'PropertyType',
      })
      .populate({
        path: 'lifeStyleId',
        select: 'name category',
        model: 'LifeStyle',
      })
      .populate({
        path: 'geoGraphyId',
        select: 'type upload name',
        model: 'GeographicalAreas',
      })
      .populate({
        path: 'rankingRequests',
        match: { status: RankingRequestStatus.ACTIVE },
        options: { sort: { bbrScore: -1 } },
      });

    return rankingCategory;
  }

  async listRankingCategoriesWithDraft(
    listRankingCategoriesWithDraftDto: RankingCategoryListDto
  ): Promise<any[]> {
    try {
      const { status, search } = listRankingCategoriesWithDraftDto;

      const paginationOptions = PaginationService.prepareOptions(listRankingCategoriesWithDraftDto);
      const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
        acc[field] = order;
        return acc;
      }, {});

      const pipeline: PipelineStage[] = [
        {
          $match: {
            isDeleted: false,
          },
        },

        {
          $lookup: {
            from: 'rankingcategorydrafts',
            localField: '_id',
            foreignField: 'rankingCategoryId',
            as: 'drafts',
          },
        },
        {
          $unwind: {
            path: '$drafts',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            'drafts.createdAt': -1,
          },
        },

        {
          $group: {
            _id: '$_id',
            latestDraft: { $first: '$drafts' },
            rankingCategoryData: { $first: '$$ROOT' },
          },
        },

        {
          $match: {
            ...(search
              ? {
                  $or: [
                    { 'latestDraft.title': { $regex: search, $options: 'i' } },
                    { 'rankingCategoryData.title': { $regex: search, $options: 'i' } },
                  ],
                }
              : {}),
          },
        },
        {
          $sort: sortObject,
        },

        {
          $project: {
            _id: 1,
            rankingCategoryDraftId: '$latestDraft._id',
            title: { $ifNull: ['$latestDraft.title', '$rankingCategoryData.title'] },
            categoryType: {
              $ifNull: ['$latestDraft.categoryType', '$rankingCategoryData.categoryType'],
            },
            criteria: { $ifNull: ['$latestDraft.criteria', '$rankingCategoryData.criteria'] },
            price: { $ifNull: ['$latestDraft.price', '$rankingCategoryData.price'] },
            rejectionReason: '$latestDraft.rejectionReason',
            residenceLimitation: {
              $ifNull: [
                '$latestDraft.residenceLimitation',
                '$rankingCategoryData.residenceLimitation',
              ],
            },
            status: {
              $cond: {
                if: { $eq: ['$latestDraft.status', 'active'] },
                then: '$rankingCategoryData.status',
                else: '$latestDraft.status',
              },
            },
            createdById: '$rankingCategoryData.createdById',
            upload: '$rankingCategoryData.upload',
            totalRequests: '$rankingCategoryData.totalRequests',
            createdAt: { $ifNull: ['$latestDraft.createdAt', '$rankingCategoryData.createdAt'] },
            updatedAt: { $ifNull: ['$latestDraft.updatedAt', '$rankingCategoryData.updatedAt'] },
          },
        },

        {
          $match: {
            ...(status ? { status: status } : {}),
          },
        },

        {
          $facet: {
            data: [
              { $skip: paginationOptions.offset },
              { $limit: Number(paginationOptions.limit) },
            ],
            totalCount: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
          },
        },
      ];

      return await this.rankingCategoryModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new Error(`Error while fetching ranking categories with drafts: ${error}`);
    }
  }
}
