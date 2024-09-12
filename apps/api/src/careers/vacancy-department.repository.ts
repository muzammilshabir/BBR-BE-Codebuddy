import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { VacancyDepartment } from './schema/vacancy-department.schema';

@Injectable()
export class VacancyDepartmentRepository extends BaseRepository<VacancyDepartment> {
  constructor(@InjectModel(VacancyDepartment.name) private readonly vacancyDepartmentModel: Model<VacancyDepartment>) {
    super(vacancyDepartmentModel);
  }

  async findById(vacancyDepartmentId: string): Promise<VacancyDepartment> {
    return this.vacancyDepartmentModel.findById(vacancyDepartmentId);
  }
}