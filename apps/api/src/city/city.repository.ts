import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { City } from './schema/city.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

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

  async findByIdInDetail(cityId: string): Promise<any> {
    const city = await this.cityModel
      .findOne({ _id: new Types.ObjectId(cityId), isDeleted: { $ne: DeletionStatus.DELETED }, active: true })
      .populate([
        { path: 'countryId' },
        { path: 'createdBy', model: 'User', select: 'fullName email role' },
        { path: 'updatedBy', model: 'User', select: 'fullName email role' },
        { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      ]);

    if (!city) {
      throw new NotFoundException(`City with ID ${cityId}`);
    }

    return city;
  }
}
