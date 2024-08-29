import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NewsroomCategory } from './schema/newsroom-category.schema';

@Injectable()
export class NewsroomCategoryRepository extends BaseRepository<NewsroomCategory> {
  constructor(@InjectModel(NewsroomCategory.name) private readonly newsroomCategoryModel: Model<NewsroomCategory>) {
    super(newsroomCategoryModel);
  }

  async findById(newsroomCategoryId: string): Promise<NewsroomCategory> {
    return this.newsroomCategoryModel.findById(newsroomCategoryId);
  }
}