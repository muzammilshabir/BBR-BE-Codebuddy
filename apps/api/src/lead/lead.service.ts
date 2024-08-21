import { Injectable } from '@nestjs/common';
import { LeadRepository } from './lead.repository';
import { CreateLeadDto } from './dto/lead.dto';
import { Lead } from './schema/lead.schema';
import { Types } from 'mongoose';

@Injectable()
export class LeadService {
  constructor(private readonly leadRepository: LeadRepository) {}

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
}
