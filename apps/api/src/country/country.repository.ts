import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Country } from './schema/country.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { NotFoundException } from '../../../../packages/api-core/modules/exceptions';

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

  async findByIdInDetail(countryId: string): Promise<any> {
    const country = await this.countryModel
      .findOne({ _id: new Types.ObjectId(countryId), isDeleted: { $ne: DeletionStatus.DELETED }, active:true })
      .populate([
        { path: 'geographicalAreasId' },
        { path: 'createdBy', model: 'User', select: 'fullName email role' },
        { path: 'updatedBy', model: 'User', select: 'fullName email role' },
        { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      ]);

    if (!country) {
      throw new NotFoundException(`Country with ID ${countryId}`);
    }

    return country;
  }
}
