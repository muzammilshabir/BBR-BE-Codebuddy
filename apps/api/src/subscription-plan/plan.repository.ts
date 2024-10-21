import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { Plan } from './schema/plan.schema';

@Injectable()
export class PlanRepository extends BaseRepository<Plan> {
  constructor(@InjectModel(Plan.name) private readonly planModel: Model<Plan>) {
    super(planModel);
  }
}
