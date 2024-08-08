import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Residence } from './schema/residences.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceRepository extends BaseRepository<Residence> {
  constructor(@InjectModel(Residence.name) private readonly residenceModel: Model<Residence>) {
    super(residenceModel);
  }
}
