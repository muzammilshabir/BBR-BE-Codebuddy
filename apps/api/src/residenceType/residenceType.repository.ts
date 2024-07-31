import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceType } from './schema/residenceType.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceTypeRepository extends BaseRepository<ResidenceType> {
  constructor(@InjectModel(ResidenceType.name) private readonly residenceTypeModel: Model<ResidenceType>) {
    super(residenceTypeModel);
  }
}