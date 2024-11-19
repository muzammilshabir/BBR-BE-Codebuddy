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
          select: 'name',
        },
        { path: 'photos', model: 'Upload' },
        { path: 'developer', model: 'User', select: 'fullName' },
      ]);
  }

  async findAllReviews(
    filter: any,
    options: any
  ): Promise<{ data: CustomerReview[]; count: number }> {
    const [data, count] = await Promise.all([
      this.customerReviewModel
        .find({ ...filter, isDeleted: false, isVerifiedBuyer: true })
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .populate([
          {
            path: 'residence',
            model: 'Residence',
            select: 'name',
          },
          {
            path: 'developer',
            model: 'User',
            select: 'fullName email',
          },
          {
            path: 'photos',
            model: 'Upload',
          },
        ])
        .lean(),
      this.customerReviewModel.countDocuments({
        ...filter,
        isDeleted: false,
        isVerifiedBuyer: true,
      }),
    ]);

    return { data, count };
  }

  async findOne(query: any): Promise<CustomerReview | null> {
    return (await this.customerReviewModel.find(query).sort({ createdAt: -1 }).limit(1).lean())[0];
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
