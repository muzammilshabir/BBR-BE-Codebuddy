import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BespokeRequest } from './schema/bespokeRequests.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { bespokeRequestStatus } from './enum/bespoke-request-status';
import { ListBespokeRequestDto } from './dto/list-bespoke-request.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class BespokeRequestRepository extends BaseRepository<BespokeRequest> {
  constructor(
    @InjectModel(BespokeRequest.name)
    private readonly featureRequestModel: Model<BespokeRequest>
  ) {
    super(featureRequestModel);
  }

  async findAllBespokeRequest(listBespokeRequestDto: ListBespokeRequestDto) {
    const { search, status, residenceId, paymentStatus } = listBespokeRequestDto;
    const paginationOptions = PaginationService.prepareOptions(listBespokeRequestDto);

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
          $or: [{ 'residence.name': { $regex: search, $options: 'i' } }],
        },
      });
    }

    // Apply categoryType filter if provided
    pipeline.push({
      $lookup: {
        from: 'uploads',
        localField: 'upload.ImageId',
        foreignField: '_id',
        as: 'images',
      },
    });

    pipeline.push({
      $sort: sortObject,
    });

    // Count total documents
    pipeline.push(
      {
        $facet: {
          data: [{ $skip: paginationOptions.offset }, { $limit: paginationOptions.limit }],
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

    return await this.featureRequestModel.aggregate(pipeline).exec();
  }

  async findByIdInDetail(id: string) {
    // Build the aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          isDeleted: { $ne: true },
          _id: new Types.ObjectId(id),
        },
      },
    ];

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

    // Apply categoryType filter if provided
    pipeline.push({
      $lookup: {
        from: 'uploads',
        localField: 'upload.ImageId',
        foreignField: '_id',
        as: 'images',
      },
    });

    // Count total documents
    pipeline.push(
      {
        $facet: {
          data: [{ $skip: 0 }, { $limit: 1 }],
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

    return await this.featureRequestModel.aggregate(pipeline).exec();
  }

  async hasActiveOrPendingRequest(residenceId: string): Promise<boolean> {
    const count = await this.featureRequestModel.countDocuments({
      residenceId: new Types.ObjectId(residenceId),
      isDeleted: false,
      $or: [
        { status: bespokeRequestStatus.PENDING },
        {
          status: bespokeRequestStatus.APPROVED,
        },
      ],
    });
    return count > 0;
  }
}
