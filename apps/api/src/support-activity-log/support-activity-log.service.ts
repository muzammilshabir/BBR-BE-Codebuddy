import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';

import { SupportActivityLogRepository } from './support-activity-log.repository';
import { CreateSupportActivityLogDto } from './dto/create-support-activity-log.dto';
import { ListSupportActivityLogDto } from './dto/list-support-activity-log.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class SupportActivityLogService {
  constructor(private readonly supportActivityLogRepository: SupportActivityLogRepository) {}

  async create(createDto: CreateSupportActivityLogDto, userId: string) {
    const activityLog = {
      ...createDto,
      supportId: new Types.ObjectId(createDto.supportId),
      userId: new Types.ObjectId(userId),
    };

    return this.supportActivityLogRepository.create(activityLog);
  }

  async list(listDto: ListSupportActivityLogDto) {
    const { search, startDate, endDate, supportId, isDownload, fileType } = listDto;

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

    // Support ID filter
    if (supportId) {
      query.supportId = new Types.ObjectId(supportId);
    }

    const options = PaginationService.prepareOptions(listDto);

    const { data, count } = await this.supportActivityLogRepository.findAll(query, options, [
      {
        path: 'userId',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'supportId',
        select: 'name address',
        model: 'Support',
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Support Activity Logs');

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
