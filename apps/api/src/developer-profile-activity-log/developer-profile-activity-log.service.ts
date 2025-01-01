import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';

import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { DeveloperProfileActivityLogRepository } from './developer-profile-activity-log.repository';
import { CreateDeveloperProfilesActivityLogDto } from './dto/create-developer-profile-activity-log.dto';
import { ListDeveloperProfilesActivityLogDto } from './dto/list-developer-profile-activity-log.dto';

@Injectable()
export class DeveloperProfileActivityLogService {
  constructor(private readonly developerActivityLogRepository: DeveloperProfileActivityLogRepository) {}

  async create(createDto: CreateDeveloperProfilesActivityLogDto, userId: string) {
    const activityLog = {
      ...createDto,
      developerId: new Types.ObjectId(createDto.developerId),
      userId: new Types.ObjectId(userId),
    };

    return this.developerActivityLogRepository.create(activityLog);
  }

  async list(listDto: ListDeveloperProfilesActivityLogDto) {
    const { search, startDate, endDate, developerId, isDownload, fileType } = listDto;

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

    // Developer ID filter
    if (developerId) {
      query.developerId = new Types.ObjectId(developerId);
    }

    const options = PaginationService.prepareOptions(listDto);

    const { data, count } = await this.developerActivityLogRepository.findAll(query, options, [
      {
        path: 'userId',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'developerId',
        select: 'name address',
        model: 'User',
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Developer Profile Activity Logs');

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
