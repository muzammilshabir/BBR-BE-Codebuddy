import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Plan } from './schema/plan.schema';

@Injectable()
export class PlanRepository extends BaseRepository<Plan> {
  constructor(@InjectModel(Plan.name) private readonly planModel: Model<Plan>) {
    super(planModel);
  }

  async findAllExpanded(filter: RootFilterQuery<Plan>): Promise<any> {
    return this.planModel
      .find(filter)
      .populate([{ path: 'features.feature', select: 'name', model: 'Feature' }]);
  }

  async findByIdExpanded(id: string): Promise<any> {
    return this.planModel
      .findById(id)
      .populate([{ path: 'features.feature', select: 'name', model: 'Feature' }]);
  }
}
