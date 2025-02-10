import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { CustomerReview } from './schema/customerReviews.schema';

@Injectable()
export class CustomerReviewRepository extends BaseRepository<CustomerReview> {
  constructor(
    @InjectModel(CustomerReview.name) private readonly customerReviewModel: Model<CustomerReview>
  ) {
    super(customerReviewModel);
  }

  async findById(id: string): Promise<CustomerReview> {
    return this.customerReviewModel
      .findOne({
        _id: id,
        isDeleted: false,
        isVerifiedBuyer: true,
      })
      .populate([
        {
          path: 'residence',
          model: 'Residence',
          select: 'name associatedBrandId cityId slug',
          populate: [
            {
              path: 'associatedBrandId',
              model: 'Brand',
              select: 'name description upload slug',
              populate: {
                path: 'upload.ImageId',
                model: 'Upload',
                select: 'originalFileKey fileKey url mimeType',
              },
            },
            {
              path: 'cityId',
              model: 'City',
              select: 'name slug',
            },
          ],
        },
        { path: 'photos', model: 'Upload' },
        { path: 'developer', model: 'User', select: 'fullName' },
      ]);
  }

  async findAllReviews(
    filter: any,
    options: any
  ): Promise<{ data: CustomerReview[]; count: number; avgOverallRating: number }> {
    const [data, count, avgOverallRatingResult] = await Promise.all([
      this.customerReviewModel
        .find({ ...filter, isDeleted: false, isVerifiedBuyer: true })
        .sort(options.sort)
        .skip(options.offset)
        .limit(options.limit)
        .populate([
          {
            path: 'residence',
            model: 'Residence',
            select: 'name visuals',
            populate: [
              {
                path: 'visuals.mainPhotos',
                model: 'Upload',
                select: 'originalFileKey fileKey url mimeType',
              },
              {
                path: 'visuals.mainGalleryPhotos',
                model: 'Upload',
                select: 'originalFileKey fileKey url mimeType',
              },
              {
                path: 'visuals.secondGalleryPhotos',
                model: 'Upload',
                select: 'originalFileKey fileKey url mimeType',
              },
              {
                path: 'visuals.videoTour',
                model: 'Upload',
                select: 'originalFileKey fileKey url mimeType',
              },
              {
                path: 'associatedBrandId',
                model: 'Brand',
                select: 'name description upload',
                populate: {
                  path: 'upload.ImageId',
                  model: 'Upload',
                  select: 'originalFileKey fileKey url mimeType',
                },
              },
            ],
          },
          {
            path: 'developer',
            model: 'User',
            select: 'fullName email',
          },
          {
            path: 'photos',
            model: 'Upload',
            select: 'originalFileKey fileKey url mimeType',
          },
        ])
        .lean<CustomerReview[]>(),
      this.customerReviewModel.countDocuments({
        ...filter,
        isDeleted: false,
        isVerifiedBuyer: true,
      }),
      this.customerReviewModel.aggregate([
        { $match: { ...filter, isDeleted: false, isVerifiedBuyer: true } },
        { $group: { _id: null, avgOverallRating: { $avg: '$overallRating' } } },
      ]),
    ]);

    const avgOverallRating = avgOverallRatingResult[0]?.avgOverallRating || 0;

    return { data, count, avgOverallRating };
  }

  async findOne(query: any): Promise<CustomerReview | null> {
    return (
      await this.customerReviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(1)
        .lean<CustomerReview>()
    )[0];
  }

  async aggregate(search: any) {
    return await this.customerReviewModel.aggregate([
      {
        $lookup: {
          from: 'residences',
          localField: 'residence',
          foreignField: '_id',
          as: 'residenceData',
        },
      },
      {
        $match: {
          'residenceData.name': { $regex: search, $options: 'i' },
          isDeleted: false,
          isVerifiedBuyer: true,
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);
  }
}
