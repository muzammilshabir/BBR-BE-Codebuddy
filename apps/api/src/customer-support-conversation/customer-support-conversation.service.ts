import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Types } from 'mongoose';
import { CustomerSupportService } from '../customer-support/customer-support.service';
import { CustomerSupportConversationRepository } from './customer-support-conversation.repository';
import { ListConversationDto } from './dto/list-conversation.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class CustomerSupportConversationService {
  constructor(
    private readonly conversationRepository: CustomerSupportConversationRepository,
    private readonly customerSupportService: CustomerSupportService
  ) {}

  async create(createConversationDto: CreateConversationDto, userId: string) {
    // Verify customer support ticket exists
    await this.customerSupportService.getCustomerSupport(createConversationDto.customerSupportId);

    const conversation = await this.conversationRepository.create({
      ...createConversationDto,
      customerSupportId: new Types.ObjectId(createConversationDto.customerSupportId),
      userId: new Types.ObjectId(userId),
      attachments: createConversationDto.attachments?.map((attachment) => ({
        ...attachment,
        fileId: new Types.ObjectId(attachment.fileId),
      })),
    });

    return conversation;
  }

  async getConversations(filterDto: ListConversationDto) {
    const result = await this.conversationRepository.findAllConversations(filterDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, filterDto);

    return { pagination, conversations: data };
  }
}
