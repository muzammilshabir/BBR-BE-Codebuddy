import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schema/lead.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class LeadRepository extends BaseRepository<Lead> {
  constructor(@InjectModel(Lead.name) private readonly leadModel: Model<Lead>) {
    super(leadModel);
  }
}
