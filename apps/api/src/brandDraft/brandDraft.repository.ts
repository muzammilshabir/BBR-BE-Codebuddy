import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BrandDraft } from './schema/brandDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListBrandDto } from '../brand/dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class BrandDraftRepository extends BaseRepository<BrandDraft> {
  constructor(@InjectModel(BrandDraft.name) private readonly brandDraftModel: Model<BrandDraft>) {
    super(brandDraftModel);
  }
  async getBrandDraftById(brandDraftId: string) {
    const brandDraft = await this.brandDraftModel.findById(brandDraftId).populate([
      { path: 'brandCategoryId', model: 'BrandCategory' },
      { path: 'brandId', model: 'Brand' },
      {
        path: 'upload.ImageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
    ]);

    if (!brandDraft) {
      throw new NotFoundException(`Brand draft with id ${brandDraftId}`);
    }

    return brandDraft;
  }

  async getLatestBrandDraftsWithResidenceCount(listBrandDto: ListBrandDto) {
    // TODO: location search
    const { search, brandCategoryId, status } = listBrandDto;
    const paginationOptions = PaginationService.prepareOptions(listBrandDto);
    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});
    return this.brandDraftModel.aggregate(
      [
        //  Match residences based on filters like brandCategoryId
        {
          $match: {
            ...(brandCategoryId ? { brandCategoryId: new Types.ObjectId(brandCategoryId) } : {}),
          },
        },
        // Sort BrandDrafts by createdAt (latest first)
        {
          $sort: { createdAt: -1 },
        },
        // Group by brandId to get the latest draft per brand
        {
          $group: {
            _id: '$brandId', // Group by brandId
            latestDraft: { $first: '$$ROOT' }, // Get the latest BrandDraft per brand
          },
        },
        // Lookup the Residence collection and count the number of residences for each brandId
        {
          $lookup: {
            from: 'residences', // Name of the residence collection
            let: { brandId: '$_id' }, // Pass the brandId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$associatedBrandId', '$$brandId'] }, // Match residences with brandId
                },
              },
              {
                $count: 'residenceCount', // Count residences
              },
            ],
            as: 'residenceData',
          },
        },
        // Add a default value for the residence count if no residences are found
        {
          $addFields: {
            residenceCount: {
              $ifNull: [{ $arrayElemAt: ['$residenceData.residenceCount', 0] }, 0],
            },
          },
        },
        // Lookup the BrandCategory collection to populate brandCategoryId in latestDraft
        {
          $lookup: {
            from: 'brandcategories', // Name of the BrandCategory collection
            localField: 'latestDraft.brandCategoryId', // Field in latestDraft to match
            foreignField: '_id', // Field in BrandCategory to match
            as: 'brandCategory', // Result field to store populated data
          },
        },
        // Add populated brandCategory to the latestDraft
        {
          $addFields: {
            'latestDraft.brandCategoryId': { $arrayElemAt: ['$brandCategory', 0] }, // Add the first matched document
          },
        },
        {
          $lookup: {
            from: 'brands',
            localField: 'latestDraft.brandId', // Correctly referencing brandId in the draft
            foreignField: '_id', // Matching it to the _id in Brand collection
            as: 'brandData',
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.upload.ImageId',
            foreignField: '_id',
            as: 'uploadDetails',
          },
        },
        {
          $unwind: {
            path: '$latestDraft.upload',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'uploads',
            localField: 'latestDraft.upload.ImageId',
            foreignField: '_id',
            as: 'uploadInfo',
          },
        },
        {
          $unwind: {
            path: '$uploadInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            latestDraft: { $first: '$latestDraft' },
            brandData: { $first: '$brandData' },
            uploadTypeDetails: {
              $push: {
                ImageId: '$latestDraft.upload.ImageId',
                upload: '$uploadInfo', // Use single type per roomTypeId
                type: '$latestDraft.upload.type',
              },
            },
          },
        },
        {
          $match: {
            ...(search
              ? {
                  $or: [{ 'latestDraft.name': { $regex: search, $options: 'i' } }],
                }
              : {}),
          },
        },
        // Project the final result
        {
          $project: {
            _id: 0, // Do not include the MongoDB-generated ID
            brandId: '$_id', // Include the brandId
            brandDraftId: '$latestDraft._id',
            name: '$latestDraft.name',
            description: '$latestDraft.description',
            brandCategoryId: '$latestDraft.brandCategoryId',
            upload: '$uploadTypeDetails',
            isDeleted: '$latestDraft.isDeleted',
            createdAt: '$latestDraft.createdAt',
            updatedAt: '$latestDraft.updatedAt',
            residenceCount: 1, // Include the residenceCount
            status: {
              $cond: {
                if: { $eq: ['$latestDraft.status', 'active'] },
                then: { $arrayElemAt: ['$brandData.status', 0] },
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
      ],
      {
        collation: { locale: 'en', strength: 1 }, // Case-insensitive collation
      }
    );
  }
}
