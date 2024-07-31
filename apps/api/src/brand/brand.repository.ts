import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<Brand>) {
    super(brandModel);
  }
}