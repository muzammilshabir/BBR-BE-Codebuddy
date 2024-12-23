import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregateOptions, Model, PipelineStage, Types } from 'mongoose';
import { CustomerSupport } from './schema/customer-support.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListCustomerSupportDto } from './dto/list-customer-support.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
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
          from: 'uploads',
          localField: 'upload.ImageId',
          foreignField: '_id',
          as: 'upload.ImageId',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo',
        },
      },
      {
        $unwind: {
          path: '$assignedTo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'assignedTo.avatarImage',
          foreignField: '_id',
          as: 'assignedTo.avatarImage',
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          email: { $first: '$email' },
          phoneNumber: { $first: '$phoneNumber' },
          status: { $first: '$status' },
          pageUrl: { $first: '$pageUrl' },
          source: { $first: '$source' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          companyName: { $first: '$companyName' },
          country: { $first: '$country' },
          note: { $first: '$note' },
          isDeleted: { $first: '$isDeleted' },
          displayId: { $first: '$displayId' },
          developerId: { $first: '$developerId' },
          user: { $first: '$user' },
          preferences: { $first: '$preferences' },
          residenceId: { $first: '$residenceId' },
          unitId: { $first: '$unitId' },
          customerSupportFeatureRequest: { $first: '$customerSupportFeatureRequest' },
          customerSupportErrorReport: { $first: '$customerSupportErrorReport' },
          websiteUrl: { $first: '$websiteUrl' },
          agreeToTerms: { $first: '$agreeToTerms' },
          message: { $first: '$message' },
          contactInfo: { $first: '$contactInfo' },
          assignedTo: { $push: '$assignedTo' },
          priority: { $first: '$priority' },
          upload: { $first: '$upload' },
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
          priority:1,
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
          assignedTo: {
            _id: 1,
            fullName: 1,
            email: 1,
            role: 1,
            avatarImage: 1,
          },
          customerSupportFeatureRequest: 1,
          customerSupportErrorReport: 1,
          websiteUrl: 1,
          agreeToTerms: 1,
          message: 1,
          contactInfo: 1,
          companyName: 1,
          preferences: 1,
          upload: 1,
        },
      },
    ]);

    if (!customerSupport) {
      throw new NotFoundException('customer support');
    }

    return customerSupport;
  }

  async findAllCustomerSupports(filterDto: ListCustomerSupportDto, developerId?: string) {
    const { status, source, search, assignedTo, priority } = filterDto;

    const paginationOptions = PaginationService.prepareOptions(filterDto);
    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});

    const result = await this.customerSupportModel.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          ...(status ? { status } : {}),
          ...(source ? { source } : {}),
          ...(developerId ? { developerId: new Types.ObjectId(developerId) } : {}),
          ...(assignedTo && assignedTo.length > 0 
            ? { assignedTo: { $in: assignedTo.map(id => new Types.ObjectId(id)) } }
            : {}),
          ...(priority ? { priority } : {}),
        },
      },
      {
        $match: {
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } },
                  { 'phoneNumber.number': { $regex: search, $options: 'i' } },
                  { displayId: { $regex: search, $options: 'i' } },
                ],
              }
            : {}),
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
          from: 'uploads',
          localField: 'upload.ImageId',
          foreignField: '_id',
          as: 'upload.ImageId',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo',
        },
      },
      {
        $unwind: {
          path: '$assignedTo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'assignedTo.avatarImage',
          foreignField: '_id',
          as: 'assignedTo.avatarImage',
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          email: { $first: '$email' },
          phoneNumber: { $first: '$phoneNumber' },
          status: { $first: '$status' },
          pageUrl: { $first: '$pageUrl' },
          priority: { $first: '$priority' },
          source: { $first: '$source' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          companyName: { $first: '$companyName' },
          country: { $first: '$country' },
          note: { $first: '$note' },
          isDeleted: { $first: '$isDeleted' },
          displayId: { $first: '$displayId' },
          developerId: { $first: '$developerId' },
          user: { $first: '$user' },
          preferences: { $first: '$preferences' },
          residenceId: { $first: '$residenceId' },
          unitId: { $first: '$unitId' },
          customerSupportFeatureRequest: { $first: '$customerSupportFeatureRequest' },
          customerSupportErrorReport: { $first: '$customerSupportErrorReport' },
          websiteUrl: { $first: '$websiteUrl' },
          agreeToTerms: { $first: '$agreeToTerms' },
          message: { $first: '$message' },
          contactInfo: { $first: '$contactInfo' },
          assignedTo: { $push: '$assignedTo' },
          upload: { $first: '$upload' },
        },
      },
      {
        $sort: sortObject,
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
          priority: 1,
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
          preferences: 1,
          assignedTo: {
            _id: 1,
            fullName: 1,
            email: 1,
            role: 1,
            avatarImage: 1,
          },
          customerSupportFeatureRequest: 1,
          customerSupportErrorReport: 1,
          websiteUrl: 1,
          agreeToTerms: 1,
          message: 1,
          contactInfo: 1,
          companyName: 1,
          upload: 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: paginationOptions.offset }, { $limit: Number(paginationOptions.limit) }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ]);

    return result;
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
          from: 'uploads',
          localField: 'upload.ImageId',
          foreignField: '_id',
          as: 'upload.ImageId',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo',
        },
      },
      {
        $unwind: {
          path: '$assignedTo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'assignedTo.avatarImage',
          foreignField: '_id',
          as: 'assignedTo.avatarImage',
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          email: { $first: '$email' },
          phoneNumber: { $first: '$phoneNumber' },
          status: { $first: '$status' },
          pageUrl: { $first: '$pageUrl' },
          source: { $first: '$source' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          companyName: { $first: '$companyName' },
          country: { $first: '$country' },
          note: { $first: '$note' },
          isDeleted: { $first: '$isDeleted' },
          displayId: { $first: '$displayId' },
          developerId: { $first: '$developerId' },
          user: { $first: '$user' },
          preferences: { $first: '$preferences' },
          residenceId: { $first: '$residenceId' },
          unitId: { $first: '$unitId' },
          customerSupportFeatureRequest: { $first: '$customerSupportFeatureRequest' },
          customerSupportErrorReport: { $first: '$customerSupportErrorReport' },
          websiteUrl: { $first: '$websiteUrl' },
          agreeToTerms: { $first: '$agreeToTerms' },
          message: { $first: '$message' },
          contactInfo: { $first: '$contactInfo' },
          assignedTo: { $push: '$assignedTo' },
          upload: { $first: '$upload' },
          priority: { $first: '$priority' },
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
          priority: 1,
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
          assignedTo: {
            _id: 1,
            fullName: 1,
            email: 1,
            role: 1,
            avatarImage: 1,
          },
          customerSupportFeatureRequest: 1,
          customerSupportErrorReport: 1,
          websiteUrl: 1,
          agreeToTerms: 1,
          message: 1,
          contactInfo: 1,
          preferences: 1,
          companyName: 1,
          upload: 1,
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
