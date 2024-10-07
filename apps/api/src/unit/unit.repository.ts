import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Unit } from './schema/unit.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { ListUnitDto } from './dto/list-unit.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class UnitRepository extends BaseRepository<Unit> {
  constructor(@InjectModel(Unit.name) private readonly unitModel: Model<Unit>) {
    super(unitModel);
  }

  async findByIdInDetail(unitId: string): Promise<Unit> {
    return this.unitModel.findById(unitId).populate([
      { path: 'residenceId' },
      { path: 'visuals.mainPhotos', model: 'Upload' },
      { path: 'visuals.mainGalleryPhotos', model: 'Upload' },
      { path: 'visuals.secondGalleryPhotos', model: 'Upload' },
      { path: 'visuals.videoTour', model: 'Upload' },
      { path: 'rooms.roomTypeId', model: 'RoomType', select: 'type' },
      {
        path: 'unitKeyFeatures.residenceServices.serviceTypeId',
        model: 'ResidenceService',
        select: 'type',
      },
      { path: 'createdById', model: 'User', select: 'fullName email role' },
      { path: 'updatedById', model: 'User', select: 'fullName email role' },
    ]);
  }

  async listUnitsWithDraft(listUnitDto: ListUnitDto): Promise<any[]> {
    try {
      const { status, residenceId, search } = listUnitDto;

      const paginationOptions = PaginationService.prepareOptions(listUnitDto);
      const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
        acc[field] = order;
        return acc;
      }, {});

      const pipeline: PipelineStage[] = [
        //  Match residences based on filters like residenceId
        {
          $match: {
            ...(residenceId ? { residenceId: new Types.ObjectId(residenceId) } : {}),
          },
        },

        // Lookup for all drafts from unitdraft collection
        {
          $lookup: {
            from: 'unitdrafts',
            localField: '_id',
            foreignField: 'unitId',
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

        // Group by unitId and keep only the latest draft
        {
          $group: {
            _id: '$_id', // Group by unitId (current residence)
            latestDraft: { $first: '$drafts' }, // Keep only the first (latest) draft
            unitData: { $first: '$$ROOT' }, // Store residence data
          },
        },

        // Lookup for the residence status from residence collection
        {
          $lookup: {
            from: 'unit',
            localField: '_id',
            foreignField: '_id',
            as: 'unit',
          },
        },
        {
          $unwind: {
            path: '$unit',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Handle search criteria (if provided)
        {
          $match: {
            ...(search
              ? {
                  $or: [
                    { 'latestDraft.unitName': { $regex: search, $options: 'i' } },
                    { 'latestDraft.specs.unitNumber': { $regex: search, $options: 'i' } },
                  ],
                }
              : {}),
          },
        },
        {
          $sort: sortObject,
        },

        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.visuals.mainPhotos',
            foreignField: '_id',
            as: 'mainPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.visuals.mainGalleryPhotos',
            foreignField: '_id',
            as: 'mainGalleryPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.visuals.secondGalleryPhotos',
            foreignField: '_id',
            as: 'secondGalleryPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.visuals.videoTour',
            foreignField: '_id',
            as: 'videoTour',
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: 'latestDraft.createdById',
            foreignField: '_id',
            as: 'createdBy',
          },
        },

        // Project only relevant fields
        {
          $project: {
            _id: 1,
            residenceId: '$latestDraft.residenceId',
            unitName: '$latestDraft.unitName',
            specs: '$latestDraft.specs',
            unitPrice: '$latestDraft.unitPrice',
            exclusiveOffer: '$latestDraft.exclusiveOffer',
            rooms: '$latestDraft.rooms',
            briefOverview: '$latestDraft.briefOverview',
            unitKeyFeatures: '$latestDraft.unitKeyFeatures',
            visuals: {
              mainPhotos: { $ifNull: [{ $arrayElemAt: ['$mainPhotos', 0] }, null] },
              mainGalleryPhotos: { $ifNull: [{ $arrayElemAt: ['$mainGalleryPhotos', 0] }, null] },
              secondGalleryPhotos: {
                $ifNull: [{ $arrayElemAt: ['$secondGalleryPhotos', 0] }, null],
              },
              videoTour: { $ifNull: [{ $arrayElemAt: ['$videoTour', 0] }, null] },
            },
            status: {
              $cond: {
                if: { $eq: ['$latestDraft.status', 'active'] },
                then: '$unit.status',
                else: '$latestDraft.status',
              },
            },
            isDeleted: '$latestDraft.isDeleted',
            createdById: {
              fullName: { $arrayElemAt: ['$createdBy.fullName', 0] },
              email: { $arrayElemAt: ['$createdBy.email', 0] },
              role: { $arrayElemAt: ['$createdBy.role', 0] },
            },
            updatedById: '$latestDraft.updatedById',
            createdAt: '$latestDraft.createdAt',
            updatedAt: '$latestDraft.updatedAt',
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

      return await this.unitModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new Error(`Error while fetching residence draft list: ${error}`);
    }
  }
}
