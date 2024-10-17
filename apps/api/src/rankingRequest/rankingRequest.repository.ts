import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { RankingRequest } from './schema/rankingRequest.schema';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { ListRankingRequestWithDraftDto } from './dto/list-ranking-request.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';

@Injectable()
export class RankingRequestRepository extends BaseRepository<RankingRequest> {
  constructor(
    @InjectModel(RankingRequest.name) private readonly rankingRequestModel: Model<RankingRequest>
  ) {
    super(rankingRequestModel);
  }

  async findById(id: string): Promise<RankingRequest> {
    return this.rankingRequestModel
      .findOne({ _id: id, isDeleted: { $ne: DeletionStatus.DELETED } })
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
  }

  async listRankingRequestWithDraft(
    listRankingRequestWithDraftDto: ListRankingRequestWithDraftDto
  ): Promise<any[]> {
    try {
      const { status, developerId, search } = listRankingRequestWithDraftDto;

      const paginationOptions = PaginationService.prepareOptions(listRankingRequestWithDraftDto);
      const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
        acc[field] = order;
        return acc;
      }, {});

      const pipeline: PipelineStage[] = [
        // Match ranking requests based on filters like developerId
        {
          $match: {
            ...(developerId ? { developerId: new Types.ObjectId(developerId) } : {}),
          },
        },

        // Lookup for all drafts from rankingrequestdrafts collection
        {
          $lookup: {
            from: 'rankingrequestdrafts',
            localField: '_id',
            foreignField: 'rankingRequestId',
            as: 'drafts',
          },
        },
        {
          $unwind: {
            path: '$drafts',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Sort drafts by createdAt in descending order (latest draft first)
        {
          $sort: {
            'drafts.createdAt': -1, // Descending order
          },
        },

        // Group by rankingRequestId and keep only the latest draft
        {
          $group: {
            _id: '$_id', // Group by rankingRequestId (current ranking request)
            latestDraft: { $first: '$drafts' }, // Keep only the first (latest) draft
            rankingRequestData: { $first: '$$ROOT' }, // Store ranking request data
            developerData: { $first: '$developerData' },
          },
        },

        // Lookup for the developer data from users collection
        {
          $lookup: {
            from: 'users',
            localField: 'latestDraft.developerId',
            foreignField: '_id',
            as: 'developerData',
          },
        },
        {
          $unwind: {
            path: '$developerData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'residences',
            localField: 'residenceId',
            foreignField: '_id',
            as: 'residence',
          },
        },
        {
          $unwind: {
            path: '$residence',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'rankingcategories',
            localField: 'rankingCategoryId',
            foreignField: '_id',
            as: 'rankingCategory',
          },
        },
        {
          $unwind: {
            path: '$rankingCategory',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Handle search criteria (if provided)
        {
          $match: {
            ...(search
              ? {
                  $or: [
                    { 'rankingCategory.title': { $regex: search, $options: 'i' } },
                    { 'developerData.fullName': { $regex: search, $options: 'i' } },
                  ],
                }
              : {}),
          },
        },
        {
          $sort: sortObject,
        },

        // Project only relevant fields
        {
          $project: {
            _id: 1,
            rankingRequestDraftId: '$latestDraft._id',
            developerId: {
              fullName: '$developerData.fullName',
              email: '$developerData.email',
              role: '$developerData.role',
            },
            createdAt: '$latestDraft.createdAt',
            updatedById: '$latestDraft.updatedById',
            updatedAt: '$latestDraft.updatedAt',
            status: {
              $cond: {
                if: { $eq: ['$latestDraft.status', 'active'] },
                then: '$rankingRequestData.status',
                else: '$latestDraft.status',
              },
            },
          },
        },

        // Apply status filter
        {
          $match: {
            ...(status ? { status: status } : {}),
          },
        },

        // Pagination and total count
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

      return await this.rankingRequestModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new Error(`Error while fetching ranking request draft list: ${error}`);
    }
  }

  // Temporary implementation: Currently returning sample data for the top 10 residences
  // due to the absence of the analytics module. This function will require refactoring
  // to integrate actual analytics data once the module is implemented, ensuring accurate
  // representation of the top residences based on views. Please revisit this function
  // after the analytics module development is complete.

  async getTop10ResidencesWithRankingRequests() {
    try {
      const result = await this.rankingRequestModel.aggregate([
        {
          $lookup: {
            from: 'residences',
            localField: 'residenceId',
            foreignField: '_id',
            as: 'residence',
          },
        },
        {
          $unwind: {
            path: '$residence',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'rankingcategories',
            localField: 'rankingCategoryId',
            foreignField: '_id',
            as: 'rankingCategory',
          },
        },
        {
          $unwind: {
            path: '$rankingCategory',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'residence.locationId',
            foreignField: '_id',
            as: 'location',
          },
        },
        {
          $unwind: {
            path: '$location',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'residence.developerId',
            foreignField: '_id',
            as: 'developer',
          },
        },
        {
          $unwind: {
            path: '$developer',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            residence: 1,
            rankingCategory: 1,
            location: 1,
            developer: 1,
          },
        },
        {
          $facet: {
            data: [{ $limit: 10 }],
            totalCount: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
          },
        },
      ]);

      console.log('Aggregation Result:', result); // Debug log

      return result;
    } catch (error) {
      console.error('Error fetching top residences with ranking requests:', error);
      throw new Error('Failed to get top residences');
    }
  }
}
