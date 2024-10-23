import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      { path: 'residenceTypeIds', select: 'type', model: 'ResidenceType' },
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

        // Lookup for all drafts from residencedrafts collection
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

        // Sort drafts by createdAt in descending order (latest draft first)
        {
          $sort: {
            'drafts.createdAt': -1, // Descending order
          },
        },

        // Group by residenceId and keep only the latest draft
        {
          $group: {
            _id: '$_id', // Group by residenceId (current residence)
            latestDraft: { $first: '$drafts' }, // Keep only the first (latest) draft
            developerData: { $first: '$developerData' }, // Retain developer data
            residenceData: { $first: '$$ROOT' }, // Store residence data
          },
        },

        //  Lookup for the developer data from users collection
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
                    { 'latestDraft.name': { $regex: search, $options: 'i' } },
                    { 'latestDraft.address.city': { $regex: search, $options: 'i' } },
                    { 'latestDraft.address.country': { $regex: search, $options: 'i' } },
                    { 'developerData.fullName': { $regex: search, $options: 'i' } }, // Search in developerData
                  ],
                }
              : {}),
          },
        },
        {
          // Lookup for multiple residence types based on an array of residenceTypeIds
          $lookup: {
            from: 'residencetypes',
            localField: 'latestDraft.residenceTypeIds', // Assuming the field is now residenceTypeIds (array)
            foreignField: '_id',
            as: 'residenceTypes',
          },
        },
        {
          $unwind: {
            path: '$residenceTypes',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'latestDraft.cityId',
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
            localField: 'latestDraft.countryId',
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
            localField: 'latestDraft.associatedBrandId',
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
            localField: 'latestDraft.residenceKeyFeatures.featureIds',
            foreignField: '_id',
            as: 'residenceFeatures',
          },
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
            from: 'amenities',
            localField: 'latestDraft.nearbyAmenities.amenitiesList',
            foreignField: '_id',
            as: 'amenitiesList',
          },
        },
        {
          $lookup: {
            from: 'amenities',
            localField: 'latestDraft.nearbyAmenities.highlightedAmenities.amenityId',
            foreignField: '_id',
            as: 'highlightedAmenities',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.nearbyAmenities.highlightedAmenities.imageId',
            foreignField: '_id',
            as: 'highlightedAmenitiesImage',
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
            residenceDraftId: '$latestDraft._id',
            name: '$latestDraft.name',
            residenceTypeIds: '$residenceTypes',
            websiteLink: '$latestDraft.websiteLink',
            associatedBrand: '$associatedBrand.name',
            briefOverview: '$latestDraft.briefOverview',
            comprehensiveOverview: '$latestDraft.comprehensiveOverview',
            budgetLimitationsRange: '$latestDraft.budgetLimitationsRange',
            residenceKeyFeatures: '$residenceFeatures',
            visuals: {
              mainPhotos: { $ifNull: ['$mainPhotos', []] },
              mainGalleryPhotos: { $ifNull: ['$mainGalleryPhotos', []] },
              secondGalleryPhotos: { $ifNull: ['$secondGalleryPhotos', []] },
              videoTour: { $ifNull: [{ $arrayElemAt: ['$videoTour', 0] }, null] },
            },
            nearbyAmenities: {
              amenitiesList: '$amenitiesList',
              highlightedAmenities: {
                amenityId: '$highlightedAmenities',
                imageId: '$highlightedAmenitiesImage',
              },
            },
            rejectionReason: '$latestDraft.rejectionReason',
            city: { name: '$city.name', type: '$city.type', countryId: '$city.countryId' },
            country: { name: '$country.name', type: '$country.type' },
            lifeStyleId: '$latestDraft.lifeStyleId',
            createdById: {
              fullName: { $arrayElemAt: ['$createdBy.fullName', 0] },
              email: { $arrayElemAt: ['$createdBy.email', 0] },
              role: { $arrayElemAt: ['$createdBy.role', 0] },
            },
            developerId: {
              fullName: '$developerData.fullName',
              email: '$developerData.email',
              role: '$developerData.role',
            },
            createdAt: '$latestDraft.createdAt',
            updatedById: '$latestDraft.updatedById',
            updatedAt: '$latestDraft.updatedAt',
            submissionDate: '$latestDraft.submissionDate',
            address: '$latestDraft.address',
            status: {
              $cond: {
                if: { $eq: ['$latestDraft.status', 'active'] },
                then: '$residence.status',
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
              { $sort: sortObject },
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

      return await this.residenceModel
        .aggregate(pipeline, {
          collation: { locale: 'en', strength: 1 }, // Case-insensitive collation
        })
        .exec();
    } catch (error) {
      throw new Error(`Error while fetching residence draft list: ${error}`);
    }
  }
}
