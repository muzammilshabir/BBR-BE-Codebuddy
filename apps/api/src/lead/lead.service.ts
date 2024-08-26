import { Injectable } from '@nestjs/common';
import { LeadRepository } from './lead.repository';
import { CreateLeadDto } from './dto/lead.dto';
import { Lead } from './schema/lead.schema';
import { Types } from 'mongoose';
import { ListLeadDto } from './dto/list-lead.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ResidenceRepository } from '../residences/residences.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import * as moment from 'moment';

@Injectable()
export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly residenceRepository: ResidenceRepository
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const transformedDto = {
      ...createLeadDto,
      residenceId: new Types.ObjectId(createLeadDto.residenceId)
        ? new Types.ObjectId(createLeadDto.residenceId)
        : undefined,
      unitId: new Types.ObjectId(createLeadDto.unitId)
        ? new Types.ObjectId(createLeadDto.unitId)
        : undefined,
    };
    return await this.leadRepository.create(transformedDto);
  }

  async listLeads(listLeadDto: ListLeadDto, sellerId: string) {
    const filter: any = {};

    // Get all residence IDs associated with the seller (developerId)
    const sellerResidences = await this.residenceRepository.findAll({
      developerId: new Types.ObjectId(sellerId),
    });
    const sellerResidenceIds = sellerResidences.data.map((residence) => residence._id);

    if (sellerResidenceIds.length === 0) {
      return {
        pagination: {
          limit: 10,
          currentPage: 1,
          totalDocs: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        leads: [],
      };
    }

    filter.residenceId = { $in: sellerResidenceIds };

    if (listLeadDto.status) {
      filter.status = listLeadDto.status;
    }

    if (listLeadDto.source) {
      filter.source = listLeadDto.source;
    }

    if (listLeadDto.search && listLeadDto.search.trim()) {
      const searchRegex = new RegExp(listLeadDto.search, 'i');
      const orConditions: any = [
        { name: { $regex: searchRegex } },
        { country: { $regex: searchRegex } },
      ];

      // Find matching residences based on residence name search within seller's residences
      const matchingResidences = await this.residenceRepository.findAll({
        name: { $regex: searchRegex },
        developerId: new Types.ObjectId(sellerId),
      });

      const matchingResidenceIds = matchingResidences.data.map((residence) => residence._id);
      if (matchingResidenceIds.length > 0) {
        orConditions.push({ residenceId: { $in: matchingResidenceIds } });
      }

      filter.$or = orConditions;
    }

    const options = PaginationService.prepareOptions(listLeadDto);
    const { data, count } = await this.leadRepository.findAll(filter, options);
    const { pagination } = PaginationService.paginate({ rows: data, count }, listLeadDto);

    return { pagination, leads: data };
  }

  async updateLeadStatus(leadId: string, status: string): Promise<any> {
    const existinLead = await this.leadRepository.update(leadId, { status });
    if (!existinLead) {
      throw new NotFoundException(`Lead with ID ${leadId}`);
    }
    return existinLead;
  }

  getLeadById(leadId: string): Promise<Lead> {
    return this.leadRepository.findById(leadId);
  }

  async getLeadCounts(sellerId: string) {
    const filter: any = {};

    // Get all residence IDs associated with the seller (developerId)
    const sellerResidences = await this.residenceRepository.findAll({
      developerId: new Types.ObjectId(sellerId),
    });
    const sellerResidenceIds = sellerResidences.data.map((residence) => residence._id);

    if (sellerResidenceIds.length === 0) {
      return { totalLeadCount: 0, last24HourLeadCount: 0 };
    }

    filter.residenceId = { $in: sellerResidenceIds };

    // Total leads count
    const totalLeadCount = await this.leadRepository.count(filter);

    // Last 24 hours leads count
    const last24Hours = moment().subtract(24, 'hours').toDate();
    const last24HourLeadCount = await this.leadRepository.count({
      ...filter,
      createdAt: { $gte: last24Hours },
    });

    return { totalLeadCount, last24HourLeadCount };
  }
}
