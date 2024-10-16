import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModulePolicy } from './schema/modulePolicy.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ModulePolicyRepository extends BaseRepository<ModulePolicy> {
  constructor(
    @InjectModel(ModulePolicy.name) private readonly modulePolicyModel: Model<ModulePolicy>
  ) {
    super(modulePolicyModel);
  }
}
