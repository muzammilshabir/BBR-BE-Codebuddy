import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandCategory } from './schema/brandCategory.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class BrandCategoryRepository extends BaseRepository<BrandCategory> {
  constructor(
    @InjectModel(BrandCategory.name) private readonly brandCategoryModel: Model<BrandCategory>
  ) {
    super(brandCategoryModel);
  }

  async find(value: any): Promise<any> {
    return await this.brandCategoryModel.findOne(value);
  }
}
