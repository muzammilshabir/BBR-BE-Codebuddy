import { LeadsActivityLogRepository } from './../leads-activity-log/leads-activity-log.repository';
import { Injectable } from '@nestjs/common';
import { LeadRepository } from './lead.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './schema/lead.schema';
import { Model, Types } from 'mongoose';
import { ListLeadDto } from './dto/list-lead.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ResidenceRepository } from '../residences/residences.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UnitRepository } from 'src/unit/unit.repository';
import { LeadStatus } from './enum/lead-enum';
import { UserRole } from '../users/enum/user.enum';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import { DevResidenceActivityLogRepository } from 'src/dev-residence-activity-log/dev-residence-activity-log.repository';
import { DevLeadsActivityLogRepository } from 'src/dev-leads-activity-log/dev-leads-activity-log.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Residence } from 'src/residences/schema/residences.schema';

@Injectable()
export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository,
    private readonly residenceActivityLogRepository: ResidenceActivityLogRepository,
    private readonly devResidenceActivityLogRepository: DevResidenceActivityLogRepository,
    private readonly developerProfileActivityLogRepository: DeveloperProfileActivityLogRepository,
    private readonly leadsActivityLogRepository: LeadsActivityLogRepository,
    private readonly devLeadsActivityLogRepository: DevLeadsActivityLogRepository,
    @InjectModel(Residence.name) private readonly residenceModel: Model<Residence>
  ) {}
  async getDeveloperId(createLeadDto: CreateLeadDto) {
    if (createLeadDto.developerId) {
      return new Types.ObjectId(createLeadDto.developerId);
    }
    if (createLeadDto.residenceId) {
      const residenceId = await this.getIdBySlugOrObjectId(
        this.residenceModel,
        createLeadDto.residenceId
      );
      return (await this.residenceRepository.findById(residenceId.toString())).developerId;
    }
    if (createLeadDto.unitId) {
      const residenceId = (await this.unitRepository.findById(createLeadDto.unitId.toString()))
        .residenceId;
      return (await this.residenceRepository.findById(residenceId.toString())).developerId;
    }
    return null;
  }

  async create(createLeadDto: CreateLeadDto, userId: string): Promise<Lead> {
    let residenceId;

    if (createLeadDto.residenceId) {
      residenceId = await this.getIdBySlugOrObjectId(
        this.residenceModel,
        createLeadDto.residenceId
      );
    }

    const transformedDto = {
      ...createLeadDto,
      residenceId: residenceId || undefined,
      unitId: createLeadDto.unitId ? new Types.ObjectId(createLeadDto.unitId) : undefined,
      developerId: await this.getDeveloperId(createLeadDto),
      preferences: {
        ...createLeadDto.preferences,
        brandIds:
          createLeadDto?.preferences?.brandIds?.map((brandId) => new Types.ObjectId(brandId)) ||
          undefined,
        residenceTypeIds:
          createLeadDto?.preferences?.residenceTypeIds?.map(
            (residenceTypeId) => new Types.ObjectId(residenceTypeId)
          ) || undefined,
        lifeStyleIds:
          createLeadDto?.preferences?.lifeStyleIds?.map(
            (lifeStyleId) => new Types.ObjectId(lifeStyleId)
          ) || undefined,
        locationIds:
          createLeadDto?.preferences?.locationIds?.map(
            (locationId) => new Types.ObjectId(locationId)
          ) || undefined,
      },
      contactInfo: {
        ...createLeadDto?.contactInfo,
        countryId: createLeadDto.contactInfo
          ? new Types.ObjectId(createLeadDto.contactInfo.countryId)
          : undefined,
      },
    };

    const result = await this.leadRepository.create(transformedDto);

    await this.residenceActivityLogRepository.create({
      residenceId,
      activityType: 'The new lead received',
      details: {
        id: result.id,
      },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.devResidenceActivityLogRepository.create({
      residenceId,
      activityType: 'The new lead received',
      details: {
        id: result.id,
      },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.leadsActivityLogRepository.create({
      leadId: new Types.ObjectId(result.id),
      activityType: 'Lead received',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.devLeadsActivityLogRepository.create({
      leadId: new Types.ObjectId(result.id),
      activityType: 'Lead received',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return result;
  }

  async getLeads(filterDto: ListLeadDto, developerId?: string) {
    const result = await this.leadRepository.findAllLeads(filterDto, developerId);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, filterDto);

    return { pagination, leads: data };
  }

  async updateLead(leadId: string, updateLeadDto: UpdateLeadDto, userId?: string): Promise<any> {
    const existingLead = userId
      ? await this.leadRepository.find({
          _id: new Types.ObjectId(leadId),
          developerId: new Types.ObjectId(userId),
        })
      : await this.leadRepository.findById(leadId);
    if (!existingLead) {
      throw new NotFoundException(`Lead with ID ${leadId}`);
    }
    const transformedDto = {
      ...updateLeadDto,
      unitId: updateLeadDto.unitId ? new Types.ObjectId(updateLeadDto.unitId) : undefined,
      preferences: {
        ...updateLeadDto?.preferences,
        brandIds:
          updateLeadDto?.preferences?.brandIds?.map((brandId) => new Types.ObjectId(brandId)) ||
          undefined,
        residenceTypeIds:
          updateLeadDto?.preferences?.residenceTypeIds?.map(
            (residenceTypeId) => new Types.ObjectId(residenceTypeId)
          ) || undefined,
        lifeStyleIds:
          updateLeadDto?.preferences?.lifeStyleIds?.map(
            (lifeStyleId) => new Types.ObjectId(lifeStyleId)
          ) || undefined,
        locationIds:
          updateLeadDto?.preferences?.locationIds?.map(
            (locationId) => new Types.ObjectId(locationId)
          ) || undefined,
      },
      contactInfo: {
        ...updateLeadDto?.contactInfo,
        countryId: updateLeadDto.contactInfo
          ? new Types.ObjectId(updateLeadDto.contactInfo.countryId)
          : undefined,
      },
    };

    if (updateLeadDto.status !== existingLead.status) {
      await this.leadsActivityLogRepository.create({
        leadId: new Types.ObjectId(leadId),
        activityType: 'Status changed',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });

      await this.devLeadsActivityLogRepository.create({
        leadId: new Types.ObjectId(leadId),
        activityType: 'Status changed',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }

    const lead = await this.leadRepository.update(leadId, transformedDto);

    await this.developerProfileActivityLogRepository.create({
      developerId: new Types.ObjectId(userId),
      activityType: `Updated lead information`,
      details: { leadId: new Types.ObjectId(leadId), leadName: lead.name },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.leadsActivityLogRepository.create({
      leadId: new Types.ObjectId(leadId),
      activityType: 'Information changed',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.devLeadsActivityLogRepository.create({
      leadId: new Types.ObjectId(leadId),
      activityType: 'Information changed',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return lead;
  }

  async getLead(leadId: string, userId?: string): Promise<Lead> {
    return userId
      ? await this.leadRepository.find({
          _id: new Types.ObjectId(leadId),
          developerId: new Types.ObjectId(userId),
        })
      : await this.leadRepository.findById(leadId);
  }

  async getLeadStatisticsAdmin() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newLeads, contactedLeads, wonLeads, lostLeads] = await Promise.all([
      this.leadRepository.countDocuments({
        status: LeadStatus.NEW,
        createdAt: { $gte: thirtyDaysAgo },
        isDeleted: false,
      }),
      this.leadRepository.countDocuments({ status: LeadStatus.CONTACTED, isDeleted: false }),
      this.leadRepository.countDocuments({ status: LeadStatus.WON, isDeleted: false }),
      this.leadRepository.countDocuments({ status: LeadStatus.LOST, isDeleted: false }),
    ]);

    return { newLeads, contactedLeads, wonLeads, lostLeads };
  }

  async getLeadCountsBySourceAdmin() {
    return this.leadRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $project: { source: '$_id', count: 1, _id: 0 } },
    ]);
  }

  async getLeadCountsByWeekAdmin() {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    return this.leadRepository.aggregate([
      {
        $match: {
          createdAt: { $gte: fourWeeksAgo },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            $floor: {
              $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60 * 24 * 7],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          week: { $subtract: [4, '$_id'] },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { week: 1 } },
      {
        $group: {
          _id: null,
          weeks: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          weeks: {
            $map: {
              input: { $range: [1, 5] },
              as: 'weekNum',
              in: {
                $let: {
                  vars: {
                    weekData: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$weeks',
                            cond: { $eq: ['$$this.week', '$$weekNum'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    week: '$$weekNum',
                    count: { $ifNull: ['$$weekData.count', 0] },
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: '$weeks' },
      { $replaceRoot: { newRoot: '$weeks' } },
    ]);
  }

  async getLeadStatistics(developerId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newLeads, totalLeads] = await Promise.all([
      this.leadRepository.countDocuments({
        developerId,
        status: LeadStatus.NEW,
        createdAt: { $gte: thirtyDaysAgo },
        isDeleted: false,
      }),
      this.leadRepository.countDocuments({ developerId, isDeleted: false }),
    ]);

    return { newLeads, totalLeads };
  }

  async getLeadCounts(
    developerId: string,
    period: 'week' | 'month' | 'year',
    countBy: 'source' | 'status' | 'country'
  ) {
    let startDate: Date;
    let groupBy: any;
    let limit: number;
    let dateField: string;

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 28);
        groupBy = {
          $floor: {
            $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60 * 24 * 7],
          },
        };
        limit = 4;
        dateField = 'week';
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        groupBy = {
          $subtract: [{ $month: new Date() }, { $month: '$createdAt' }],
        };
        limit = 12;
        dateField = 'month';
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        groupBy = {
          $subtract: [{ $year: new Date() }, { $year: '$createdAt' }],
        };
        limit = 5;
        dateField = 'year';
        break;
    }

    return this.leadRepository.aggregate([
      {
        $match: {
          developerId,
          createdAt: { $gte: startDate },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            timePeriod: groupBy,
            key: `$${countBy}`,
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.timePeriod',
          data: {
            $push: {
              key: '$_id.key',
              count: '$count',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
      {
        $project: {
          timePeriod: { $subtract: [limit, '$_id'] },
          data: 1,
          totalCount: 1,
          _id: 0,
        },
      },
      {
        $group: {
          _id: null,
          periods: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          periods: {
            $map: {
              input: { $range: [1, limit + 1] },
              as: 'num',
              in: {
                $let: {
                  vars: {
                    periodData: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$periods',
                            cond: { $eq: ['$$this.timePeriod', '$$num'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    [dateField]: '$$num',
                    data: { $ifNull: ['$$periodData.data', []] },
                    totalCount: { $ifNull: ['$$periodData.totalCount', 0] },
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: '$periods' },
      { $replaceRoot: { newRoot: '$periods' } },
      { $sort: { [dateField]: 1 } },
    ]);
  }

  async getLeadConversionByTime(developerId: string, period: 'weeks' | 'months' | 'years') {
    let startDate: Date;
    let groupBy: any;
    let limit: number;
    let dateField: string;

    switch (period) {
      case 'weeks':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 28);
        groupBy = {
          $floor: {
            $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60 * 24 * 7],
          },
        };
        limit = 4;
        dateField = 'week';
        break;
      case 'months':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        groupBy = {
          $subtract: [{ $month: new Date() }, { $month: '$createdAt' }],
        };
        limit = 12;
        dateField = 'month';
        break;
      case 'years':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        groupBy = {
          $subtract: [{ $year: new Date() }, { $year: '$createdAt' }],
        };
        limit = 5;
        dateField = 'year';
        break;
    }

    return this.leadRepository.aggregate([
      {
        $match: {
          developerId,
          createdAt: { $gte: startDate },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: groupBy,
          totalLeads: { $sum: 1 },
          wonLeads: {
            $sum: {
              $cond: [{ $eq: ['$status', LeadStatus.WON] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          timePeriod: { $subtract: [limit, '$_id'] },
          conversionRate: {
            $cond: [
              { $eq: ['$totalLeads', 0] },
              0,
              {
                $multiply: [{ $divide: ['$wonLeads', '$totalLeads'] }, 100],
              },
            ],
          },
          _id: 0,
        },
      },
      {
        $group: {
          _id: null,
          periods: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          periods: {
            $map: {
              input: { $range: [1, limit + 1] },
              as: 'num',
              in: {
                $let: {
                  vars: {
                    periodData: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$periods',
                            cond: { $eq: ['$$this.timePeriod', '$$num'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    [dateField]: '$$num',
                    conversionRate: { $ifNull: ['$$periodData.conversionRate', 0] },
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: '$periods' },
      { $replaceRoot: { newRoot: '$periods' } },
      { $sort: { [dateField]: 1 } },
    ]);
  }

  async getLeadsWithRole(query: ListLeadDto, user: JwtPayloadType) {
    return user.role === UserRole.SELLER
      ? await this.getLeads(query, user.sub)
      : await this.getLeads(query);
  }

  async updateLeadWithRole(leadId: string, updateLeadDto: UpdateLeadDto, user: JwtPayloadType) {
    return user.role === UserRole.SELLER
      ? await this.updateLead(leadId, updateLeadDto, user.sub)
      : await this.updateLead(leadId, updateLeadDto);
  }

  async getLeadWithRole(leadId: string, user: JwtPayloadType) {
    return user.role === UserRole.SELLER
      ? await this.getLead(leadId, user.sub)
      : await this.getLead(leadId);
  }

  async deleteLead(leadId: string, userId?: string): Promise<Lead> {
    const existingLead = userId
      ? await this.leadRepository.find({
          _id: new Types.ObjectId(leadId),
          developerId: new Types.ObjectId(userId),
        })
      : await this.leadRepository.findById(leadId);

    if (!existingLead) {
      throw new NotFoundException(`Lead with ID ${leadId}`);
    }

    return this.leadRepository.update(leadId, { isDeleted: true });
  }

  async deleteLeadWithRole(leadId: string, user: JwtPayloadType) {
    return user.role === UserRole.SELLER
      ? await this.deleteLead(leadId, user.sub)
      : await this.deleteLead(leadId);
  }

  async getIdBySlugOrObjectId(
    model: Model<any>,
    idOrSlug: string,
    selectField = '_id'
  ): Promise<Types.ObjectId | null> {
    if (Types.ObjectId.isValid(idOrSlug)) {
      // If it's a valid ObjectId, return it directly
      return new Types.ObjectId(idOrSlug);
    }

    // Otherwise, find by slug
    const result = await model.findOne({ slug: idOrSlug }).select(selectField).exec();
    return result ? result[selectField] : null;
  }
}
