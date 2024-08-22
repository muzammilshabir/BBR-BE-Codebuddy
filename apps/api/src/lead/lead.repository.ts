import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schema/lead.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import * as moment from 'moment';
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

  async weeklyCountLeadsCreated(startDate: Date, groupBy?: any) {
    return this.leadModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by the group (day, week, or month)
    ]);
  }

  async weeklyCeadsConverted(startDate: Date, interval: string, groupBy?: any) {
    return this.leadModel.aggregate([
      { $match: { convertedAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by the group (day, week, or month)
    ]);
  }

  async monthlyCountLeadsCreated(startDate: Date, groupBy: any) {
    return this.leadModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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
      },
      { $sort: { _id: 1 } }, // Sort by the week number
    ]);
  }

  async monthlyCountLeadsConverted(startDate: Date, groupBy: any) {
    return this.leadModel.aggregate([
      { $match: { convertedAt: { $gte: startDate } } },
      {
        $addFields: {
          weekOfMonth: {
            $ceil: { $divide: [{ $dayOfMonth: '$convertedAt' }, 7] },
          },
        },
      },
      {
        $group: {
          _id: '$weekOfMonth', // Group by week of the month
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by the week number
    ]);
  }

  async yearlyCountLeadsCreated(startDate: Date, groupBy: any) {
    return this.leadModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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
      },
      { $sort: { _id: 1 } }, // Sort by the month number
    ]);
  }

  async yearlyCountLeadsConverted(startDate: Date, groupBy: any) {
    return this.leadModel.aggregate([
      { $match: { convertedAt: { $gte: startDate } } },
      {
        $addFields: {
          monthOfYear: { $month: '$convertedAt' }, // Extract month from convertedAt
        },
      },
      {
        $group: {
          _id: '$monthOfYear', // Group by month of the year
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by the month number
    ]);
  }
}
