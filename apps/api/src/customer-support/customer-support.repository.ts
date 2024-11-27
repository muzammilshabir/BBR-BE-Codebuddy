import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregateOptions, Model, PipelineStage, Types } from 'mongoose';
import { CustomerSupport } from './schema/customer-support.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
@Injectable()
export class CustomerSupportRepository extends BaseRepository<CustomerSupport> {
  constructor(
    @InjectModel(CustomerSupport.name) private readonly customerSupportModel: Model<CustomerSupport>
  ) {
    super(customerSupportModel);
  }
  async find(filter: any) {
    const [customerSupport] = await this.customerSupportModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residenceId',
        },
      },
      {
        $unwind: {
          path: '$residenceId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId',
        },
      },
      {
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developerId',
        },
      },
      {
        $unwind: {
          path: '$developerId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'user.avatarImage',
          foreignField: '_id',
          as: 'user.avatarImage',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'developerId.avatarImage',
          foreignField: '_id',
          as: 'developerId.avatarImage',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          status: 1,
          pageUrl: 1,
          source: 1,
          createdAt: 1,
          updatedAt: 1,
          country: 1,
          budget: 1,
          note: 1,
          isDeleted: 1,
          displayId: 1,
          developerId: {
            fullName: '$developerId.fullName',
            email: '$developerId.email',
            role: '$developerId.role',
            avatarImage: '$developerId.avatarImage',
          },
          user: {
            fullName: '$user.fullName',
            email: '$user.email',
            role: '$user.role',
            avatarImage: '$user.avatarImage',
          },
          residenceId: 1,
          unitId: 1,
        },
      },
    ]);

    if (!customerSupport) {
      throw new NotFoundException('customer support');
    }

    return customerSupport;
  }

  async findById(customerSupportId: string) {
    const [customerSupport] = await this.customerSupportModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(customerSupportId),
        },
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residenceId',
        },
      },
      {
        $unwind: {
          path: '$residenceId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId',
        },
      },
      {
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developerId',
        },
      },
      {
        $unwind: {
          path: '$developerId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'preferences.brandIds',
          foreignField: '_id',
          as: 'preferences.brandIds',
        },
      },
      {
        $lookup: {
          from: 'residencetypes',
          localField: 'preferences.residenceTypeIds',
          foreignField: '_id',
          as: 'preferences.residenceTypeIds',
        },
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'preferences.locationIds',
          foreignField: '_id',
          as: 'preferences.locationIds',
        },
      },
      {
        $lookup: {
          from: 'lifestyles',
          localField: 'preferences.lifeStyleIds',
          foreignField: '_id',
          as: 'preferences.lifeStyleIds',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'user.avatarImage',
          foreignField: '_id',
          as: 'user.avatarImage',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'developerId.avatarImage',
          foreignField: '_id',
          as: 'developerId.avatarImage',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'customerSupportFeatureRequest.documents',
          foreignField: '_id',
          as: 'customerSupportFeatureRequest.documents',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'customerSupportErrorReport.documents',
          foreignField: '_id',
          as: 'customerSupportErrorReport.documents',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { assignedTo: '$assignedTo' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$assignedTo'] } } },
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
          as: 'assignedTo',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          status: 1,
          pageUrl: 1,
          source: 1,
          createdAt: 1,
          updatedAt: 1,
          companyName: 1,
          country: 1,
          note: 1,
          isDeleted: 1,
          displayId: 1,
          developerId: {
            fullName: '$developerId.fullName',
            email: '$developerId.email',
            role: '$developerId.role',
            avatarImage: '$developerId.avatarImage',
          },
          user: {
            fullName: '$user.fullName',
            email: '$user.email',
            role: '$user.role',
            avatarImage: '$user.avatarImage',
          },
          preferences: 1,
          residenceId: 1,
          unitId: 1,
          customerSupportFeatureRequest: 1,
          customerSupportErrorReport: 1,
          websiteUrl: 1,
          agreeToTerms: 1,
          message: 1,
          contactInfo: 1,
        },
      },
    ]);

    if (!customerSupport) {
      throw new NotFoundException(`customer support with ID ${customerSupportId}`);
    }

    return customerSupport;
  }

  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.customerSupportModel.aggregate(pipeline, options);
  }

  async countDocuments(filter: any, options?: any) {
    return this.customerSupportModel.countDocuments(filter, options);
  }
}
