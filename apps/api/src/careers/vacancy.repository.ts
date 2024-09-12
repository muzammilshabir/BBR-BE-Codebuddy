import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vacancy } from './schema/vacancy.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class VacancyRepository extends BaseRepository<Vacancy> {
  constructor(@InjectModel(Vacancy.name) private readonly vacancyModel: Model<Vacancy>) {
    super(vacancyModel);
  }

  async findById(vacancyPostId: string): Promise<Vacancy> {
    return this.vacancyModel.findById(vacancyPostId);
  }
}