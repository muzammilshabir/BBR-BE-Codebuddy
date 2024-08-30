import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country } from './schema/country.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class CountryRepository extends BaseRepository<Country> {
  constructor(
    @InjectModel(Country.name)
    private readonly countryModel: Model<Country>
  ) {
    super(countryModel);
  }

  async find(value: any): Promise<any> {
    return await this.countryModel.findOne(value);
  }
}
