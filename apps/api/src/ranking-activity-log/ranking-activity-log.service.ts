import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';

import { RankingActivityLogRepository } from './ranking-activity-log.repository';
import { CreateRankingActivityLogDto } from './dto/create-ranking-activity-log.dto';
import { ListRankingActivityLogDto } from './dto/list-ranking-activity-log.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class RankingActivityLogService {
  constructor(private readonly rankingActivityLogRepository: RankingActivityLogRepository) {}

  async create(createDto: CreateRankingActivityLogDto, userId: string) {
    const activityLog = {
      ...createDto,
      rankingId: new Types.ObjectId(createDto.rankingId),
      userId: new Types.ObjectId(userId),
    };

    return this.rankingActivityLogRepository.create(activityLog);
  }

  async list(listDto: ListRankingActivityLogDto) {
    const { search, startDate, endDate, rankingId, categoryId, isDownload, fileType } = listDto;

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

    // Ranking ID filter
    if (rankingId) {
      query.rankingId = new Types.ObjectId(rankingId);
    }

    if (categoryId) {
      query.categoryId = new Types.ObjectId(categoryId);
    }

    const options = PaginationService.prepareOptions(listDto);

    const { data, count } = await this.rankingActivityLogRepository.findAll(query, options, [
      {
        path: 'userId',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'rankingId',
        select: 'name address',
        model: 'RankingRequest',
      },
      {
        path: 'categoryId',
        select: 'name address',
        model: 'RankingCategory',
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking Activity Logs');

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
