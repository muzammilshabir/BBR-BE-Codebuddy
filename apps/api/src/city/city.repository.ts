import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from './schema/city.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class CityRepository extends BaseRepository<City> {
  constructor(
    @InjectModel(City.name)
    private readonly cityModel: Model<City>
  ) {
    super(cityModel);
  }
  async findByCityName(name: string): Promise<City> {
    return await this.cityModel.findOne({ name });
  }
}
