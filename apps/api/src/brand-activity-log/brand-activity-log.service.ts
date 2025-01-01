import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';

import { BrandActivityLogRepository } from './brand-activity-log.repository';
import { CreateBrandActivityLogDto } from './dto/create-brand-activity-log.dto';
import { ListBrandActivityLogDto } from './dto/list-brand-activity-log.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class BrandActivityLogService {
  constructor(private readonly brandActivityLogRepository: BrandActivityLogRepository) {}

  async create(createDto: CreateBrandActivityLogDto, userId: string) {
    const activityLog = {
      ...createDto,
      brandId: new Types.ObjectId(createDto.brandId),
      userId: new Types.ObjectId(userId),
    };

    return this.brandActivityLogRepository.create(activityLog);
  }

  async list(listDto: ListBrandActivityLogDto) {
    const { search, startDate, endDate, brandId, isDownload, fileType } = listDto;

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

    // Brand ID filter
    if (brandId) {
      query.brandId = new Types.ObjectId(brandId);
    }

    const options = PaginationService.prepareOptions(listDto);

    const { data, count } = await this.brandActivityLogRepository.findAll(query, options, [
      {
        path: 'userId',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'brandId',
        select: 'name address',
        model: 'Brand',
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Brand Activity Logs');

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
