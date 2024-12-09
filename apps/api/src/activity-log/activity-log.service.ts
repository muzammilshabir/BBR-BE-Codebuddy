import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { Types } from 'mongoose';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ListActivityLogDto } from './dto/list-activity-log.dto';
import { LeadService } from '../lead/lead.service';
import { ActivityLog } from './schema/activity-log.schema';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';

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

  async update(id: string, updateData: UpdateActivityLogDto) {
    const activityLog = await this.activityLogRepository.findById(id);
    if (!activityLog) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    return this.activityLogRepository.update(id, updateData);
  }

  async delete(id: string) {
    const activityLog = await this.activityLogRepository.findById(id);
    if (!activityLog) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
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

    if (listActivityLogDto.isDownload) {
      if (listActivityLogDto.fileType === 'csv') {
        return this.generateCsv(data);
      } else if (listActivityLogDto.fileType === 'excel') {
        return this.generateExcel(data);
      }
    }

    const { pagination } = PaginationService.paginate({ rows: data, count }, listActivityLogDto);

    return { pagination, activityLogs: data };
  }

  private async generateCsv(activityLogs: ActivityLog[]): Promise<Buffer> {
    const csvStream = format({ headers: true });
    const bufferStream = new Writable();
    const data: Buffer[] = [];

    // Write chunks of data to a buffer array
    bufferStream._write = (chunk, encoding, next) => {
      data.push(chunk);
      next();
    };

    csvStream.pipe(bufferStream);

    // Writing each activity log object to CSV
    activityLogs.forEach((activityLog: any) => {

      csvStream.write({
        'Activity': activityLog?.activity || '',
        'Timestamp': activityLog?.timestamp || '',
        'Note': activityLog?.note || '',
      });
    });

    csvStream.end();

    // Await the CSV generation and return the file
    const csvFile = await new Promise<Buffer>((resolve) => {
      bufferStream.on('finish', () => {
        resolve(Buffer.concat(data));
      });
    });

    return csvFile;
  }

  private async generateExcel(activityLogs: ActivityLog[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheetData = activityLogs.map((activityLog: any) => {
      return {
        'Activity': activityLog?.activity || '',
        'Timestamp': activityLog?.timestamp || '',
        'Note': activityLog?.note || '',
      };
    });
    
    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activity Logs');

    // Write the workbook to a buffer
    const excelFileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return excelFileBuffer;
  }

}
