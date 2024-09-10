import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { VacancyApplication } from './schema/vacancy-application.schema';

@Injectable()
export class VacancyApplicationRepository extends BaseRepository<VacancyApplication> {
  constructor(@InjectModel(VacancyApplication.name) private readonly vacancyApplicationModel: Model<VacancyApplication>) {
    super(vacancyApplicationModel);
  }

  async findById(vacancyApplicationId: string): Promise<VacancyApplication> {
    return this.vacancyApplicationModel.findById(vacancyApplicationId);
  }
}