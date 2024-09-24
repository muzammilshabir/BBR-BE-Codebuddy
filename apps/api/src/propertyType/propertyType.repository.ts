import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyType } from './schema/propertyType.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class PropertyTypeRepository extends BaseRepository<PropertyType> {
  constructor(
    @InjectModel(PropertyType.name) private readonly propertyTypeModel: Model<PropertyType>
  ) {
    super(propertyTypeModel);
  }
}
