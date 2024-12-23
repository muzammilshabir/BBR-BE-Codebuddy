import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregateOptions, Model, PipelineStage, Types } from 'mongoose';
import { Lead } from './schema/lead.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListLeadDto } from './dto/list-lead.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
@Injectable()
export class LeadRepository extends BaseRepository<Lead> {
  constructor(@InjectModel(Lead.name) private readonly leadModel: Model<Lead>) {
    super(leadModel);
  }
  async find(filter: any) {
    const [lead] = await this.leadModel.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residenceId'
        }
      },
      {
        $unwind: {
          path: '$residenceId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId'
        }
      },
      {
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developerId'
        }
      },
      {
        $unwind: {
          path: '$developerId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'preferences.brandIds',
          foreignField: '_id',
          as: 'preferences.brandIds'
        }
      },
      {
        $lookup: {
          from: 'residencetypes',
          localField: 'preferences.residenceTypeIds',
          foreignField: '_id',
          as: 'preferences.residenceTypeIds'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'preferences.locationIds',
          foreignField: '_id',
          as: 'preferences.locationIds'
        }
      },
      {
        $lookup: {
          from: 'lifestyles',
          localField: 'preferences.lifeStyleIds',
          foreignField: '_id',
          as: 'preferences.lifeStyleIds'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'user.avatarImage',
          foreignField: '_id',
          as: 'user.avatarImage'
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'developerId.avatarImage',
          foreignField: '_id',
          as: 'developerId.avatarImage'
        }
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
          dealValue:1,
          budget: 1,
          note: 1,
          isDeleted: 1,
          displayId: 1,
          developerId: {
            fullName: '$developerId.fullName',
            email: '$developerId.email',
            role: '$developerId.role',
            avatarImage: '$developerId.avatarImage',
            createdAt: '$user.createdAt',
            _id: '$user._id',

          },
          user: {
            fullName: '$user.fullName',
            email: '$user.email',
            role: '$user.role',
            avatarImage: '$user.avatarImage',
            _id: '$user._id',
            createdAt: '$user.createdAt',
          },
          residenceId: 1,
          unitId: 1,
          contactedAt: 1,
          convertedAt: 1,
          expectedCloseDate: 1,
          lastContactedAt: 1,
          dealPercentage: 1,
          unitPrice: 1,
          contactInfo: 1,
          preferences: 1,
          agreeToTerms: 1,
          receiveNewsletter: 1,
          companyName: 1,
          companyOrOrgLink: 1,
        }
      }
    ]);

    if (!lead) {
      throw new NotFoundException('lead');
    }

    return lead;
  }

  async findById(leadId: string) {
    const [lead] = await this.leadModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(leadId)
        }
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residenceId'
        }
      },
      {
        $unwind: {
          path: '$residenceId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId'
        }
      },
      {
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developerId'
        }
      },
      {
        $unwind: {
          path: '$developerId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'preferences.brandIds',
          foreignField: '_id',
          as: 'preferences.brandIds'
        }
      },
      {
        $lookup: {
          from: 'residencetypes',
          localField: 'preferences.residenceTypeIds',
          foreignField: '_id',
          as: 'preferences.residenceTypeIds'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'preferences.locationIds',
          foreignField: '_id',
          as: 'preferences.locationIds'
        }
      },
      {
        $lookup: {
          from: 'lifestyles',
          localField: 'preferences.lifeStyleIds',
          foreignField: '_id',
          as: 'preferences.lifeStyleIds'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'user.avatarImage',
          foreignField: '_id',
          as: 'user.avatarImage'
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'developerId.avatarImage',
          foreignField: '_id',
          as: 'developerId.avatarImage'
        }
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
          dealValue:1,
          budget: 1,
          note: 1,
          isDeleted: 1,
          displayId: 1,
          developerId: {
            fullName: '$developerId.fullName',
            email: '$developerId.email',
            role: '$developerId.role',
            avatarImage: '$developerId.avatarImage',
            createdAt: '$user.createdAt',
            _id: '$user._id',

          },
          user: {
            fullName: '$user.fullName',
            email: '$user.email',
            role: '$user.role',
            avatarImage: '$user.avatarImage',
            _id: '$user._id',
            createdAt: '$user.createdAt',
          },
          preferences:1,
          residenceId: 1,
          unitId: 1,
          contactedAt: 1,
          convertedAt: 1,
          expectedCloseDate: 1,
          lastContactedAt: 1,
          dealPercentage: 1,
          unitPrice: 1,
          contactInfo: 1,
          agreeToTerms: 1,
          receiveNewsletter: 1,
          companyName: 1,
          companyOrOrgLink: 1,
        }
      }
    ]);

    if (!lead) {
      throw new NotFoundException(`lead with ID ${leadId}`);
    }

    return lead;
  }

  async findAllLeads(filterDto: ListLeadDto, developerId?: string) {
    const { status, source, search, startDate, endDate, isRegistered , residenceId } = filterDto;

    const paginationOptions = PaginationService.prepareOptions(filterDto);
    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});

    const result = await this.leadModel.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          ...(status ? { status } : {}),
          ...(source ? { source } : {}),
          ...(developerId ? { developerId: new Types.ObjectId(developerId) } : {}),
          ...(startDate && endDate
            ? { createdAt: { $gte: startDate, $lte: endDate } }
            : {}),
          ...(residenceId ? { residenceId: new Types.ObjectId(residenceId) } : {}),
        },
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residenceId'
        }
      },
      {
        $unwind: {
          path: '$residenceId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } },
                  { country: { $regex: search, $options: 'i' } },
                  { displayId: { $regex: search, $options: 'i' } },
                  { unitId: { $regex: search, $options: 'i' } },
                  { residenceId: { $regex: search, $options: 'i' } },
                  { 'phoneNumber.number': { $regex: search, $options: 'i' } },
                  { 'residenceId.name': { $regex: search, $options: 'i' } },
                ],
              }
            : {}),
        },
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId'
        }
      },
      {
        $unwind: {
          path: '$unitId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developerId'
        }
      },
      {
        $unwind: {
          path: '$developerId',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'preferences.brandIds',
          foreignField: '_id',
          as: 'preferences.brandIds'
        }
      },
      {
        $lookup: {
          from: 'residencetypes',
          localField: 'preferences.residenceTypeIds',
          foreignField: '_id',
          as: 'preferences.residenceTypeIds'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'preferences.locationIds',
          foreignField: '_id',
          as: 'preferences.locationIds'
        }
      },
      {
        $lookup: {
          from: 'lifestyles',
          localField: 'preferences.lifeStyleIds',
          foreignField: '_id',
          as: 'preferences.lifeStyleIds'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          ...((String(isRegistered)==='true') ? { user: { $ne: null } } : {})
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'user.avatarImage',
          foreignField: '_id',
          as: 'user.avatarImage'
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'developerId.avatarImage',
          foreignField: '_id',
          as: 'developerId.avatarImage'
        }
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
          dealValue:1,
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
            createdAt: '$user.createdAt',
            _id: '$user._id',

          },
          user: {
            fullName: '$user.fullName',
            email: '$user.email',
            role: '$user.role',
            avatarImage: '$user.avatarImage',
            _id: '$user._id',
            createdAt: '$user.createdAt',
          },
          residenceId: 1,
          unitId: 1,
          agreeToTerms: 1,
          contactedAt: 1,
          convertedAt: 1,
          expectedCloseDate: 1,
          lastContactedAt: 1,
          dealPercentage: 1,
          unitPrice: 1,
          contactInfo: 1,
          preferences: 1,
          receiveNewsletter: 1,
          companyName: 1,
          companyOrOrgLink: 1,

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

  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.leadModel.aggregate(pipeline, options);
  }

  async countDocuments(filter: any, options?: any) {
    return this.leadModel.countDocuments(filter, options);
  }
}
