import { Injectable } from '@nestjs/common';
import { LeadRepository } from './lead.repository';
import { CreateLeadDto } from './dto/lead.dto';
import { Lead } from './schema/lead.schema';
import { Types } from 'mongoose';
import { ListLeadDto } from './dto/list-lead.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ResidenceRepository } from '../residences/residences.repository';

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

  async listLeads(listLeadDto: ListLeadDto) {
    const filter: any = {};

    if (listLeadDto.residenceId) {
      filter.residenceId = new Types.ObjectId(listLeadDto.residenceId);
    }

    if (listLeadDto.status) {
      filter.status = listLeadDto.status;
    }

    if (listLeadDto.source) {
      filter.source = listLeadDto.source;
    }
    // Handle the search functionality
    if (listLeadDto.search) {
      const searchRegex = new RegExp(listLeadDto.search, 'i');

      // Find matching residenceIds based on residence name search
      const matchingResidences = await this.residenceRepository.findAll({
        name: { $regex: searchRegex },
      });

      const matchingResidenceIds = matchingResidences.data.map((residence) => residence._id);

      const orConditions: any = [
        { name: { $regex: searchRegex } },
        { country: { $regex: searchRegex } },
      ];

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
}
