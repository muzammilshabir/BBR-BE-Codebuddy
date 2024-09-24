import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schema/lead.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import * as moment from 'moment';
import { Interval } from './enum/lead-enum';
@Injectable()
export class LeadRepository extends BaseRepository<Lead> {
  constructor(@InjectModel(Lead.name) private readonly leadModel: Model<Lead>) {
    super(leadModel);
  }

  async findById(leadId: string) {
    const lead = (await this.leadModel.findById(leadId)).populate([
      { path: 'residenceId' },
      { path: 'unitId' },
    ]);

    if (!lead) {
      throw new NotFoundException(`lead with ID ${leadId}`);
    }

    return lead;
  }

  async countLeadsCreated(startDate: Date, interval: string) {
    const pipeline: any[] = [{ $match: { createdAt: { $gte: startDate } } }];
    if (interval === Interval.WEEKLY) {
      pipeline.push({
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // Group by day of the week
          count: { $sum: 1 },
        },
      });
    }
    if (interval === Interval.MONTHLY) {
      pipeline.push(
        {
          $addFields: {
            weekOfMonth: {
              $ceil: { $divide: [{ $dayOfMonth: '$createdAt' }, 7] },
            },
          },
        },
        {
          $group: {
            _id: '$weekOfMonth', // Group by week of the month
            count: { $sum: 1 },
          },
        }
      );
    }
    if (interval === Interval.YEARLY) {
      pipeline.push(
        {
          $addFields: {
            monthOfYear: { $month: '$createdAt' }, // Extract month from createdAt
          },
        },
        {
          $group: {
            _id: '$monthOfYear', // Group by month of the year
            count: { $sum: 1 },
          },
        }
      );
    }
    pipeline.push({ $sort: { _id: 1 } });
    return this.leadModel.aggregate(pipeline);
  }

  async countleadsConverted(startDate: Date, interval: string) {
    const pipeline: any[] = [{ $match: { convertedAt: { $gte: startDate } } }];
    if (interval === Interval.WEEKLY) {
      pipeline.push({
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // Group by day of the week
          count: { $sum: 1 },
        },
      });
    }
    if (interval === Interval.MONTHLY) {
      pipeline.push(
        {
          $addFields: {
            weekOfMonth: {
              $ceil: { $divide: [{ $dayOfMonth: '$createdAt' }, 7] },
            },
          },
        },
        {
          $group: {
            _id: '$weekOfMonth', // Group by week of the month
            count: { $sum: 1 },
          },
        }
      );
    }
    if (interval === Interval.YEARLY) {
      pipeline.push(
        {
          $addFields: {
            monthOfYear: { $month: '$createdAt' }, // Extract month from createdAt
          },
        },
        {
          $group: {
            _id: '$monthOfYear', // Group by month of the year
            count: { $sum: 1 },
          },
        }
      );
    }
    pipeline.push({ $sort: { _id: 1 } });
    return this.leadModel.aggregate(pipeline);
  }
}
