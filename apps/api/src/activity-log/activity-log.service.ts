import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { Types } from 'mongoose';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ListActivityLogDto } from './dto/list-activity-log.dto';
import { LeadService } from '../lead/lead.service';

@Injectable()
export class ActivityLogService {
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly leadService: LeadService
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto, userId: string) {
    const lead = await this.leadService.getLead(createActivityLogDto.leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${createActivityLogDto.leadId} not found`);
    }

    const activityLog = {
      ...createActivityLogDto,
      leadId: new Types.ObjectId(createActivityLogDto.leadId),
      userId: new Types.ObjectId(userId),
    };
    return this.activityLogRepository.create(activityLog);
  }

  async update(id: string, updateData: UpdateActivityLogDto, userId: string) {
    const activityLog = await this.activityLogRepository.findById(id);
    if (!activityLog) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    if (activityLog.userId.toString() !== userId) {
      throw new Error('Unauthorized to update this activity log');
    }

    return this.activityLogRepository.update(id, updateData);
  }

  async delete(id: string, userId: string) {
    const activityLog = await this.activityLogRepository.findById(id);
    if (!activityLog) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    if (activityLog.userId.toString() !== userId) {
      throw new Error('Unauthorized to delete this activity log');
    }

    return this.activityLogRepository.update(id, { isDeleted: true });
  }

  async findAll(listActivityLogDto: ListActivityLogDto) {
    const { search, startDate, endDate, leadId } = listActivityLogDto;

    const query: any = {
      isDeleted: { $ne: true },
    };

    if (search) {
      query.$or = [
        { activity: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Lead ID filter
    if (leadId) {
      query.leadId = new Types.ObjectId(leadId);
    }

    const options = PaginationService.prepareOptions(listActivityLogDto);

    const { data, count } = await this.activityLogRepository.findAll(query, options, [
      {
        path: 'userId',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'leadId',
        select: 'name email',
        model: 'Lead',
      },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listActivityLogDto);

    return { pagination, activityLogs: data };
  }
}
