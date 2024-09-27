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
    const { residenceId, search, status } = listUnitDto;

    const paginationOptions = PaginationService.prepareOptions(listUnitDto);
    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});

    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...(residenceId ? { residenceId: new Types.ObjectId(residenceId) } : {}),
          isDeleted: false,
        },
      },
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
          preserveNullAndEmptyArrays: true, // Keep units without drafts
        },
      },
      {
        $sort: sortObject,
      },
      {
        $group: {
          _id: '$_id',
          residenceId: { $first: '$residenceId' },
          unitName: { $first: '$unitName' },
          specs: { $first: '$specs' },
          unitPrice: { $first: '$unitPrice' },
          exclusiveOffer: { $first: '$exclusiveOffer' },
          rooms: { $first: '$rooms' },
          briefOverview: { $first: '$briefOverview' },
          unitKeyFeatures: { $first: '$unitKeyFeatures' },
          visuals: { $first: '$visuals' },
          isDeleted: { $first: '$isDeleted' },
          createdById: { $first: '$createdById' },
          updatedById: { $first: '$updatedById' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          status: { $first: '$status' }, // original unit status
          finalStatus: {
            $first: {
              $cond: {
                if: { $eq: ['$drafts.status', 'active'] },
                then: '$status', // Use unit status if draft is active
                else: {
                  $cond: {
                    if: { $ne: ['$drafts', null] },
                    then: '$drafts.status', // Use draft status if it exists
                    else: '$status', // Use unit status if no draft exists
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          residenceId: 1,
          unitName: 1,
          specs: 1,
          unitPrice: 1,
          exclusiveOffer: 1,
          rooms: 1,
          briefOverview: 1,
          unitKeyFeatures: 1,
          visuals: 1,
          isDeleted: 1,
          createdById: 1,
          updatedById: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          finalStatus: 1, // final status after draft check
          latestDraft: 1, // details of the latest draft
        },
      },
      {
        $match: {
          ...(search
            ? {
                $or: [
                  { unitName: { $regex: search, $options: 'i' } },
                  { 'specs.unitNumber': { $regex: search, $options: 'i' } },
                ],
              }
            : {}),
          ...(status ? { finalStatus: status } : {}), // Apply status filter on final status
        },
      },
      {
        $facet: {
          data: [
            { $skip: paginationOptions.offset }, // Pagination offset
            { $limit: Number(paginationOptions.limit) }, // Pagination limit
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
  }
}
