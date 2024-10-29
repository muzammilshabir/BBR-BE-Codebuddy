import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregateOptions, Model, PipelineStage } from 'mongoose';
import { Lead } from './schema/lead.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
@Injectable()
export class LeadRepository extends BaseRepository<Lead> {
  constructor(@InjectModel(Lead.name) private readonly leadModel: Model<Lead>) {
    super(leadModel);
  }
  async find(filter: any) {
    const lead = (await this.leadModel.findOne(filter).populate([
      { path: 'residenceId' },
      { path: 'unitId' },
      { path: 'developerId' },
      'user'
    ]));

    if (!lead) {
      throw new NotFoundException(`lead `);
    }

    return lead;
  }

  async findById(leadId: string) {
    const lead = (await this.leadModel.findById(leadId).populate([
      { path: 'residenceId' },
      { path: 'unitId' },
      { path: 'developerId' },
      'user'
    ]));

    if (!lead) {
      throw new NotFoundException(`lead with ID ${leadId}`);
    }

    return lead;
  }

  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.leadModel.aggregate(pipeline, options);
  }

  async countDocuments(filter: any, options?: any) {
    return this.leadModel.countDocuments(filter, options);
  }
}
