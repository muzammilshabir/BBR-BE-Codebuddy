import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Residence } from './schema/residences.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { AddKeyFeaturesDto } from './dto/residenceKeyFeatures.dto';

@Injectable()
export class ResidenceRepository extends BaseRepository<Residence> {
  constructor(@InjectModel(Residence.name) private readonly residenceModel: Model<Residence>) {
    super(residenceModel);
  }
  async addKeyFeatures(id: string, addKeyFeaturesDto: AddKeyFeaturesDto): Promise<Residence> {
    return await this.residenceModel.findByIdAndUpdate(
      id,
      { $set: { residenceKeyFeatures: { ...addKeyFeaturesDto } } },
      { new: true }
    );
  }
}
