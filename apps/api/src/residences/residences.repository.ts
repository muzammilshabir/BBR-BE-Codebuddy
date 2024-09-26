import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Residence } from './schema/residences.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { PipelineStage } from 'mongoose';
import { ListResidenceWithDraftDto } from './dto/list-residence.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class ResidenceRepository extends BaseRepository<Residence> {
  constructor(@InjectModel(Residence.name) private readonly residenceModel: Model<Residence>) {
    super(residenceModel);
  }

  async findByIdInDetail(residenceId: string): Promise<any> {
    let residence: any = await this.residenceModel.findById(residenceId).populate([
      { path: 'residenceTypeId', select: 'type' },
      { path: 'cityId', select: 'name type countryId' },
      { path: 'countryId', select: 'name type' },
      { path: 'associatedBrandId', select: 'name' },
      { path: 'residenceKeyFeatures.featureIds', select: 'name', model: 'ResidenceFeature' },
      {
        path: 'visuals.mainGalleryPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.secondGalleryPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.videoTour',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'nearbyAmenities.amenitiesList', select: 'name', model: 'Amenity' },
      { path: 'nearbyAmenities.highlightedAmenities.amenityId', select: 'name', model: 'Amenity' },
      {
        path: 'nearbyAmenities.highlightedAmenities.imageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'createdById', model: 'User', select: 'fullName email role' },
      { path: 'developerId', model: 'User', select: 'fullName email role' },
    ]);

    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId}`);
    }

    residence = residence.toObject();
    const units = await this.residenceModel.aggregate([
      { $match: { _id: new Types.ObjectId(residenceId) } },

      {
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: 'residenceId',
          as: 'units',
        },
      },

      {
        $project: {
          units: 1,
        },
      },
    ]);

    residence.units = units.length > 0 ? units[0].units : [];
    return residence;
  }

  async listResidencesWithDraft(
    listResidenceWithDraftDto: ListResidenceWithDraftDto
  ): Promise<any[]> {
    const { status, developerId, search } = listResidenceWithDraftDto;

    const paginationOptions = PaginationService.prepareOptions(listResidenceWithDraftDto);

    // Manually convert sort from array to object format
    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});

    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...(developerId ? { developerId: new Types.ObjectId(developerId) } : {}),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developerData',
        },
      },
      {
        $unwind: {
          path: '$developerData',
          preserveNullAndEmptyArrays: true, // To keep residences without a developer
        },
      },
      {
        $match: {
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { 'address.city': { $regex: search, $options: 'i' } },
                  { 'address.country': { $regex: search, $options: 'i' } },
                  { 'developerData.fullName': { $regex: search, $options: 'i' } },
                ],
              }
            : {}),
        },
      },

      {
        $lookup: {
          from: 'residencedrafts',
          localField: '_id',
          foreignField: 'residenceId',
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
        $sort: sortObject,
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          residenceTypeId: { $first: '$residenceTypeId' },
          locationId: { $first: '$locationId' },
          websiteLink: { $first: '$websiteLink' },
          associatedBrandId: { $first: '$associatedBrandId' },
          briefOverview: { $first: '$briefOverview' },
          comprehensiveOverview: { $first: '$comprehensiveOverview' },
          budgetLimitationsRange: { $first: '$budgetLimitationsRange' },
          residenceKeyFeatures: { $first: '$residenceKeyFeatures' },
          visuals: { $first: '$visuals' },
          nearbyAmenities: { $first: '$nearbyAmenities' },
          status: { $first: '$status' }, // original status
          rejectionReason: { $first: '$rejectionReason' },
          cityId: { $first: '$cityId' },
          countryId: { $first: '$countryId' },
          lifeStyleId: { $first: '$lifeStyleId' },
          createdById: { $first: '$createdById' },
          developerId: { $first: '$developerId' },
          createdAt: { $first: '$createdAt' },
          updatedById: { $first: '$updatedById' },
          updatedAt: { $first: '$updatedAt' },
          submissionDate: { $first: '$submissionDate' },
          address: { $first: '$address' },
          latestDraft: { $first: '$drafts' },
          finalStatus: {
            $first: {
              $cond: {
                if: { $eq: ['$latestDraft.status', 'active'] },
                then: '$latestDraft.status', // draft status if active
                else: '$status', // original status otherwise
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          residenceTypeId: 1,
          locationId: 1,
          websiteLink: 1,
          associatedBrandId: 1,
          briefOverview: 1,
          comprehensiveOverview: 1,
          budgetLimitationsRange: 1,
          residenceKeyFeatures: 1,
          visuals: 1,
          nearbyAmenities: 1,
          rejectionReason: 1,
          cityId: 1,
          countryId: 1,
          lifeStyleId: 1,
          createdById: 1,
          developerId: 1,
          createdAt: 1,
          updatedById: 1,
          updatedAt: 1,
          submissionDate: 1,
          address: 1,
          finalStatus: 1, // the final status to be used after draft check
          details: {
            $cond: {
              if: { $eq: ['$latestDraft.status', 'active'] },
              then: {
                status: '$status',
              },
              else: {
                // Return latest draft details
                _id: '$latestDraft._id',
                residenceId: '$latestDraft.residenceId',
                status: '$latestDraft.status',
                rejectionReason: '$rejectionReason',
                createdAt: '$latestDraft.createdAt',
                createdById: '$latestDraft.createdById',
                // Add any other fields you want to return from the latest draft
              },
            },
          },
        },
      },
      // Apply status filter after finalStatus has been evaluated
      {
        $match: {
          ...(status ? { finalStatus: status } : {}), // filter based on finalStatus
        },
      },
      {
        $facet: {
          data: [
            { $skip: paginationOptions.offset }, // Apply pagination skip
            { $limit: Number(paginationOptions.limit) }, // Apply pagination limit
          ],
          totalCount: [
            { $count: 'count' }, // Get total count of matching documents
          ],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ];

    return await this.residenceModel.aggregate(pipeline).exec();
  }
}
