import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';

import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { LeadsActivityLogRepository } from './leads-activity-log.repository';
import { CreateLeadsActivityLogDto } from './dto/create-leads-activity-log.dto';
import { ListLeadsActivityLogDto } from './dto/list-leads-activity-log.dto';

@Injectable()
export class LeadsActivityLogService {
  constructor(private readonly leadsActivityLogRepository: LeadsActivityLogRepository) {}

  async create(createDto: CreateLeadsActivityLogDto, userId: string) {
    const activityLog = {
      ...createDto,
      leadId: new Types.ObjectId(createDto.leadId),
      userId: new Types.ObjectId(userId),
    };

    return this.leadsActivityLogRepository.create(activityLog);
  }

  async list(listDto: ListLeadsActivityLogDto) {
    const { search, startDate, endDate, leadId, isDownload, fileType } = listDto;

    const query: any = {
      isDeleted: { $ne: true },
    };

    // Search filters
    if (search) {
      query.$or = [
        { activity: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Date filters
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

    const options = PaginationService.prepareOptions(listDto);

    const { data, count } = await this.leadsActivityLogRepository.findAll(query, options, [
      {
        path: 'userId',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'leadId',
        select: 'name address',
        model: 'Lead',
      },
    ]);

    // Handle file download
    if (isDownload) {
      if (fileType === 'csv') {
        return this.generateCsv(data);
      } else if (fileType === 'excel') {
        return this.generateExcel(data);
      }
    }

    const { pagination } = PaginationService.paginate({ rows: data, count }, listDto);

    return { pagination, activityLogs: data };
  }

  private async generateCsv(activityLogs: any[]): Promise<Buffer> {
    const csvStream = format({ headers: true });
    const bufferStream = new Writable();
    const data: Buffer[] = [];

    bufferStream._write = (chunk, encoding, next) => {
      data.push(chunk);
      next();
    };

    csvStream.pipe(bufferStream);

    activityLogs.forEach((log) => {
      csvStream.write({
        'Activity': log?.activity || '',
        'Timestamp': log?.timestamp || '',
        'Notes': log?.notes || '',
      });
    });

    csvStream.end();

    return new Promise<Buffer>((resolve) => {
      bufferStream.on('finish', () => {
        resolve(Buffer.concat(data));
      });
    });
  }

  private async generateExcel(activityLogs: any[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheetData = activityLogs.map((log) => ({
      'Activity': log?.activity || '',
      'Timestamp': log?.timestamp || '',
      'Notes': log?.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Activity Logs');

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
