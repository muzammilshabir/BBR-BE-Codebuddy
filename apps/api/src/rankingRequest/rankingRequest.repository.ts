import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { RankingRequest } from './schema/rankingRequest.schema';
import { DeletionStatus } from '../unit/enum/unit-enum';
import {
  ListRankingRequestDto,
  ListRankingRequestForUserDto,
  ListRankingRequestWithDraftDto,
} from './dto/list-ranking-request.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { RankingCategoryStatus } from '../rankingCategory/enum/rankingCategory-status.enum';

@Injectable()
export class RankingRequestRepository extends BaseRepository<RankingRequest> {
  constructor(
    @InjectModel(RankingRequest.name) private readonly rankingRequestModel: Model<RankingRequest>
  ) {
    super(rankingRequestModel);
  }

  async findById(id: string): Promise<any> {
    return this.rankingRequestModel
      .findOne({
        _id: id,
        isDeleted: { $ne: DeletionStatus.DELETED },
      })
      .populate([
        {
          path: 'residenceId',
          populate: [
            {
              path: 'visuals.mainPhotos',
            },
            {
              path: 'visuals.mainGalleryPhotos',
            },
            {
              path: 'visuals.secondGalleryPhotos',
            },
            {
              path: 'visuals.videoTour',
            },
            {
              path: 'residenceKeyFeatures.featureIds',
              model: 'ResidenceFeature',
            },
            {
              path: 'countryId',
              model: 'Country',
            },
            {
              path: 'cityId',
              model: 'City',
            },
            {
              path: 'createdById',
              model: 'User',
              select: 'fullName email role loginAddress',
            },
          ],
        },
        {
          path: 'rankingCategoryId',
        },
        {
          path: 'developerId',
          model: 'User',
          select: 'fullName email role loginAddress',
        },
        {
          path: 'upload.ImageId',
          model: 'Upload',
          select: 'originalFileKey fileKey url mimeType',
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
            isDeleted: { $ne: true },
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

  // TODO: Temporary implementation: Currently returning sample data for the top 10 residences
  // due to the absence of the analytics module. This function will require refactoring
  // to integrate actual analytics data once the module is implemented, ensuring accurate
  // representation of the top residences based on views. Please revisit this function
  // after the analytics module development is complete.

  async getTop10ResidencesWithRankingRequests() {
    try {
      const result = await this.rankingRequestModel.aggregate([
        {
          $match: {
            isDeleted: { $ne: true },
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
        {
          $lookup: {
            from: 'locations',
            localField: 'residence.locationId',
            foreignField: '_id',
            as: 'residence.location',
          },
        },
        {
          $unwind: {
            path: '$residence.location',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'residence.visuals.mainPhotos',
            foreignField: '_id',
            as: 'residence.visuals.mainPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'residence.visuals.mainGalleryPhotos',
            foreignField: '_id',
            as: 'residence.visuals.mainGalleryPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'residence.visuals.secondGalleryPhotos',
            foreignField: '_id',
            as: 'residence.visuals.secondGalleryPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'residence.visuals.videoTour',
            foreignField: '_id',
            as: 'residence.visuals.videoTour',
          },
        },
        {
          $lookup: {
            from: 'residencefeatures',
            localField: 'residence.residenceKeyFeatures.featureIds',
            foreignField: '_id',
            as: 'residence.residenceKeyFeatures.residenceFeatures',
          },
        },
        {
          $lookup: {
            from: 'countries',
            localField: 'residence.countryId',
            foreignField: '_id',
            as: 'residence.country',
          },
        },
        { $unwind: { path: '$residence.country', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'cities',
            localField: 'residence.cityId',
            foreignField: '_id',
            as: 'residence.city',
          },
        },
        { $unwind: { path: '$residence.city', preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: 'users',
            let: { createdById: '$residence.createdById' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$createdById'] } } },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  role: 1,
                  loginAddress: {
                    country: 1,
                    state: 1,
                    city: 1,
                  },
                  contactInfo: 1,
                },
              },
            ],
            as: 'residence.createdBy',
          },
        },
        {
          $unwind: {
            path: '$residence.developer',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'users',
            let: { developerId: '$developerId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$developerId'] } } },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  role: 1,
                  loginAddress: {
                    country: 1,
                    state: 1,
                    city: 1,
                  },
                },
              },
            ],
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

  async findAllRankingRequest(listRankingRequestDto: ListRankingRequestDto) {
    const {
      search,
      status,
      developerId,
      rankingCategoryId,
      paymentStatus,
      categoryType,
      residenceId,
    } = listRankingRequestDto;
    const paginationOptions = PaginationService.prepareOptions(listRankingRequestDto);

    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});
    // Build the aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          isDeleted: { $ne: true },
        },
      },
    ];

    if (developerId) {
      pipeline.push({
        $match: {
          developerId: new Types.ObjectId(developerId),
        },
      });
    }

    if (status) {
      pipeline.push({
        $match: { status },
      });
    }

    if (paymentStatus) {
      pipeline.push({
        $match: { paymentStatus },
      });
    }

    if (rankingCategoryId) {
      pipeline.push({
        $match: {
          rankingCategoryId: new Types.ObjectId(rankingCategoryId),
        },
      });
    }

    if (residenceId) {
      pipeline.push({
        $match: {
          residenceId: new Types.ObjectId(residenceId),
        },
      });
    }

    // Lookup and unwind stages for related documents
    pipeline.push(
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      { $unwind: { path: '$residence', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'rankingcategories',
          localField: 'rankingCategoryId',
          foreignField: '_id',
          as: 'rankingCategory',
        },
      },
      { $unwind: { path: '$rankingCategory', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.mainPhotos',
          foreignField: '_id',
          as: 'residence.visuals.mainPhotos',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.mainGalleryPhotos',
          foreignField: '_id',
          as: 'residence.visuals.mainGalleryPhotos',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.secondGalleryPhotos',
          foreignField: '_id',
          as: 'residence.visuals.secondGalleryPhotos',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.videoTour',
          foreignField: '_id',
          as: 'residence.visuals.videoTour',
        },
      },
      {
        $lookup: {
          from: 'residencefeatures',
          localField: 'residence.residenceKeyFeatures.featureIds',
          foreignField: '_id',
          as: 'residence.residenceKeyFeatures.residenceFeatures',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'residence.countryId',
          foreignField: '_id',
          as: 'residence.country',
        },
      },
      { $unwind: { path: '$residence.country', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'cities',
          localField: 'residence.cityId',
          foreignField: '_id',
          as: 'residence.city',
        },
      },
      { $unwind: { path: '$residence.city', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'users',
          let: { createdById: '$residence.createdById' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$createdById'] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                role: 1,
                loginAddress: {
                  country: 1,
                  state: 1,
                  city: 1,
                },
                contactInfo: 1,
              },
            },
          ],
          as: 'residence.createdBy',
        },
      },
      {
        $unwind: { path: '$residence.createdBy', preserveNullAndEmptyArrays: true },
      }
    );

    // Apply search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'rankingCategory.title': { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // Apply categoryType filter if provided
    if (categoryType) {
      pipeline.push({
        $match: {
          'rankingCategory.categoryType': categoryType,
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          let: { developerId: '$developerId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$developerId'] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                role: 1,
                loginAddress: {
                  country: 1,
                  state: 1,
                  city: 1,
                },
              },
            },
          ],
          as: 'developer',
        },
      },
      { $unwind: { path: '$developer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'uploads',
          localField: 'upload.ImageId',
          foreignField: '_id',
          as: 'images',
        },
      }
    );

    pipeline.push({
      $sort: sortObject,
    });

    // Count total documents
    pipeline.push(
      {
        $facet: {
          data: [{ $limit: paginationOptions.limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      }
    );

    // Pagination
    pipeline.push({ $skip: paginationOptions.offset }, { $limit: paginationOptions.limit });

    return await this.rankingRequestModel.aggregate(pipeline).exec();
  }

  async findAllRankingRequestForUser(listRankingRequestForUserDto: ListRankingRequestForUserDto) {
    const {
      search,
      rankingCategoryId,
      categoryType,
      lifeStyleIds,
      brandIds,
      residenceTypeIds,
      cityId,
      countryId,
      locationId,
      geoGraphyId,
      residenceId,
    } = listRankingRequestForUserDto;
    const paginationOptions = PaginationService.prepareOptions(listRankingRequestForUserDto);

    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});
    // Build the aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          status: RankingCategoryStatus.ACTIVE,
          isDeleted: { $ne: true },
        },
      },
    ];

    if (rankingCategoryId) {
      pipeline.push({
        $match: {
          rankingCategoryId: new Types.ObjectId(rankingCategoryId),
        },
      });
    }

    if (residenceId) {
      pipeline.push({
        $match: {
          residenceId: new Types.ObjectId(residenceId),
        },
      });
    }

    // Lookup and unwind stages for related documents
    pipeline.push(
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      { $unwind: { path: '$residence', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'rankingcategories',
          localField: 'rankingCategoryId',
          foreignField: '_id',
          as: 'rankingCategory',
        },
      },
      { $unwind: { path: '$rankingCategory', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.mainPhotos',
          foreignField: '_id',
          as: 'residence.visuals.mainPhotos',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.mainGalleryPhotos',
          foreignField: '_id',
          as: 'residence.visuals.mainGalleryPhotos',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.secondGalleryPhotos',
          foreignField: '_id',
          as: 'residence.visuals.secondGalleryPhotos',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'residence.visuals.videoTour',
          foreignField: '_id',
          as: 'residence.visuals.videoTour',
        },
      },
      {
        $lookup: {
          from: 'residencefeatures',
          localField: 'residence.residenceKeyFeatures.featureIds',
          foreignField: '_id',
          as: 'residence.residenceKeyFeatures.residenceFeatures',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'residence.countryId',
          foreignField: '_id',
          as: 'residence.country',
        },
      },
      { $unwind: { path: '$residence.country', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'cities',
          localField: 'residence.cityId',
          foreignField: '_id',
          as: 'residence.city',
        },
      },
      { $unwind: { path: '$residence.city', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'users',
          let: { createdById: '$residence.createdById' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$createdById'] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                role: 1,
                loginAddress: {
                  country: 1,
                  state: 1,
                  city: 1,
                },
                contactInfo: 1,
              },
            },
          ],
          as: 'residence.createdBy',
        },
      },
      {
        $unwind: { path: '$residence.createdBy', preserveNullAndEmptyArrays: true },
      }
    );

    // Apply search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'rankingCategory.title': { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // Apply categoryType filter if provided
    if (categoryType) {
      pipeline.push({
        $match: {
          'rankingCategory.categoryType': categoryType,
        },
      });
    }

    if (lifeStyleIds && lifeStyleIds.length > 0) {
      pipeline.push({
        $match: {
          'rankingCategory.lifeStyleId': {
            $in: lifeStyleIds.map((lifeStyleId) => new Types.ObjectId(lifeStyleId)),
          },
        },
      });
    }

    if (brandIds && brandIds.length > 0) {
      pipeline.push({
        $match: {
          'rankingCategory.brandId': {
            $in: brandIds.map((brandId) => new Types.ObjectId(brandId)),
          },
        },
      });
    }

    if (residenceTypeIds && residenceTypeIds.length > 0) {
      pipeline.push({
        $match: {
          'residence.residenceTypeIds': {
            $in: residenceTypeIds.map((residenceTypeId) => new Types.ObjectId(residenceTypeId)),
          },
        },
      });
    }

    if (countryId) {
      pipeline.push({
        $match: {
          'rankingCategory.countryId': {
            $eq: new Types.ObjectId(countryId),
          },
        },
      });
    }

    if (cityId) {
      pipeline.push({
        $match: {
          'rankingCategory.cityId': {
            $eq: new Types.ObjectId(cityId),
          },
        },
      });
    }

    if (locationId) {
      pipeline.push({
        $match: {
          'rankingCategory.locationId': {
            $eq: new Types.ObjectId(locationId),
          },
        },
      });
    }

    if (geoGraphyId) {
      pipeline.push({
        $match: {
          'rankingCategory.geoGraphyId': {
            $eq: new Types.ObjectId(geoGraphyId),
          },
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          let: { developerId: '$developerId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$developerId'] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                role: 1,
                loginAddress: {
                  country: 1,
                  state: 1,
                  city: 1,
                },
              },
            },
          ],
          as: 'developer',
        },
      },
      { $unwind: { path: '$developer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'uploads',
          localField: 'upload.ImageId',
          foreignField: '_id',
          as: 'images',
        },
      }
    );

    pipeline.push({
      $sort: sortObject,
    });


    // Count total documents
    pipeline.push(
      {
        $facet: {
          data: [{ $limit: paginationOptions.limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      }
    );

    // Pagination
    pipeline.push({ $skip: paginationOptions.offset }, { $limit: paginationOptions.limit });

    return await this.rankingRequestModel.aggregate(pipeline).exec();
  }
}
