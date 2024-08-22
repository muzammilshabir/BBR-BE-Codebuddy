import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schema/lead.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

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
}
