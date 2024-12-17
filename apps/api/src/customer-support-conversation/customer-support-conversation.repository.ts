import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomerSupportConversation } from './schema/customer-support-conversation.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListConversationDto } from './dto/list-conversation.dto';

@Injectable()
export class CustomerSupportConversationRepository extends BaseRepository<CustomerSupportConversation> {
  constructor(
    @InjectModel(CustomerSupportConversation.name)
    private readonly conversationModel: Model<CustomerSupportConversation>
  ) {
    super(conversationModel);
  }

  async findAllConversations(filterDto: ListConversationDto) {
    const { customerSupportId, search } = filterDto;

    const paginationOptions = PaginationService.prepareOptions(filterDto);
    const sortObject = paginationOptions.sort.reduce((acc, [field, order]) => {
      acc[field] = order;
      return acc;
    }, {});

    const conversations = await this.conversationModel
      .aggregate([
        {
          $match: {
            customerSupportId: new Types.ObjectId(customerSupportId),
            isDeleted: { $ne: true },
            ...(search ? { message: { $regex: search, $options: 'i' } } : {}),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
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
            localField: 'attachments.fileId',
            foreignField: '_id',
            as: 'attachmentFiles',
          },
        },
        {
          $addFields: {
            attachments: {
              $map: {
                input: '$attachments',
                as: 'attachment',
                in: {
                  fileId: '$$attachment.fileId',
                  type: '$$attachment.type',
                  file: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$attachmentFiles',
                          cond: { $eq: ['$$this._id', '$$attachment.fileId'] },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: sortObject,
        },
        {
          $project: {
            _id: 1,
            customerSupportId: 1,
            message: 1,
            createdAt: 1,
            updatedAt: 1,
            attachments: 1,
            user: {
              _id: '$user._id',
              fullName: '$user.fullName',
              email: '$user.email',
              role: '$user.role',
              avatarImage: { $arrayElemAt: ['$user.avatarImage', 0] },
            },
          },
        },

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
      ])
      .exec();
    return conversations;
  }
}
