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
        path: 'visuals.mainPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
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
    //TODO: Add search by property name
    try {
      const { status, developerId, search } = listResidenceWithDraftDto;

      const paginationOptions = PaginationService.prepareOptions(listResidenceWithDraftDto);
      const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
        acc[field] = order;
        return acc;
      }, {});

      const pipeline: PipelineStage[] = [
        //  Match residences based on filters like developerId
        {
          $match: {
            ...(developerId ? { developerId: new Types.ObjectId(developerId) } : {}),
          },
        },

        //  Lookup for the latest draft from residencedrafts collection
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

        //  Lookup for the developer data from users collection
        {
          $lookup: {
            from: 'users',
            localField: 'drafts.developerId',
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

        // Lookup for the residence status from residence collection
        {
          $lookup: {
            from: 'residences',
            localField: '_id',
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

        // Handle search criteria (if provided)
        {
          $match: {
            ...(search
              ? {
                  $or: [
                    { 'drafts.name': { $regex: search, $options: 'i' } },
                    { 'drafts.address.city': { $regex: search, $options: 'i' } },
                    { 'drafts.address.country': { $regex: search, $options: 'i' } },
                    { 'developerData.fullName': { $regex: search, $options: 'i' } }, // Search in developerData
                  ],
                }
              : {}),
          },
        },
        {
          $sort: sortObject,
        },
        // Lookups for population (residenceTypeId, cityId, etc.)
        {
          $lookup: {
            from: 'residencetypes',
            localField: 'drafts.residenceTypeId',
            foreignField: '_id',
            as: 'residenceType',
          },
        },
        {
          $unwind: {
            path: '$residenceType',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'drafts.cityId',
            foreignField: '_id',
            as: 'city',
          },
        },
        {
          $unwind: {
            path: '$city',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'countries',
            localField: 'drafts.countryId',
            foreignField: '_id',
            as: 'country',
          },
        },
        {
          $unwind: {
            path: '$country',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'associatedbrands',
            localField: 'drafts.associatedBrandId',
            foreignField: '_id',
            as: 'associatedBrand',
          },
        },
        {
          $unwind: {
            path: '$associatedBrand',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'residencefeatures',
            localField: 'drafts.residenceKeyFeatures.featureIds',
            foreignField: '_id',
            as: 'residenceFeatures',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'drafts.visuals.mainPhotos',
            foreignField: '_id',
            as: 'mainPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'drafts.visuals.mainGalleryPhotos',
            foreignField: '_id',
            as: 'mainGalleryPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'drafts.visuals.secondGalleryPhotos',
            foreignField: '_id',
            as: 'secondGalleryPhotos',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'drafts.visuals.videoTour',
            foreignField: '_id',
            as: 'videoTour',
          },
        },
        {
          $lookup: {
            from: 'amenities',
            localField: 'drafts.nearbyAmenities.amenitiesList',
            foreignField: '_id',
            as: 'amenitiesList',
          },
        },
        {
          $lookup: {
            from: 'amenities',
            localField: 'drafts.nearbyAmenities.highlightedAmenities.amenityId',
            foreignField: '_id',
            as: 'highlightedAmenities',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'drafts.nearbyAmenities.highlightedAmenities.imageId',
            foreignField: '_id',
            as: 'highlightedAmenitiesImage',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'drafts.createdById',
            foreignField: '_id',
            as: 'createdBy',
          },
        },

        // Project only relevant fields
        {
          $project: {
            _id: 1,
            name: '$drafts.name',
            residenceTypeId: '$residenceType',
            websiteLink: '$drafts.websiteLink',
            associatedBrand: '$associatedBrand.name',
            briefOverview: '$drafts.briefOverview',
            comprehensiveOverview: '$drafts.comprehensiveOverview',
            budgetLimitationsRange: '$drafts.budgetLimitationsRange',
            residenceKeyFeatures: '$residenceFeatures',
            visuals: {
              mainPhotos: { $arrayElemAt: ['$mainPhotos', 0] },
              mainGalleryPhotos: { $arrayElemAt: ['$mainGalleryPhotos', 0] },
              secondGalleryPhotos: { $arrayElemAt: ['$secondGalleryPhotos', 0] },
              videoTour: { $arrayElemAt: ['$videoTour', 0] },
            },
            nearbyAmenities: {
              amenitiesList: '$amenitiesList',
              highlightedAmenities: {
                amenityId: '$highlightedAmenities',
                imageId: '$highlightedAmenitiesImage',
              },
            },
            rejectionReason: '$drafts.rejectionReason',
            city: { name: '$city.name', type: '$city.type', countryId: '$city.countryId' },
            country: { name: '$country.name', type: '$country.type' },
            lifeStyleId: '$drafts.lifeStyleId',
            createdBy: {
              fullName: { $arrayElemAt: ['$createdBy.fullName', 0] },
              email: { $arrayElemAt: ['$createdBy.email', 0] },
              role: { $arrayElemAt: ['$createdBy.role', 0] },
            },
            developer: {
              fullName: { $arrayElemAt: ['$developerData.fullName', 0] },
              email: { $arrayElemAt: ['$developerData.email', 0] },
              role: { $arrayElemAt: ['$developerData.role', 0] },
            },
            createdAt: '$drafts.createdAt',
            updatedById: '$drafts.updatedById',
            updatedAt: '$drafts.updatedAt',
            submissionDate: '$drafts.submissionDate',
            address: '$drafts.address',
            status: {
              $cond: {
                if: { $eq: ['$drafts.status', 'active'] },
                then: '$residence.status',
                else: '$drafts.status',
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

      return await this.residenceModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new Error(`Error while fetching residence draft list: ${error}`);
    }
  }
}
