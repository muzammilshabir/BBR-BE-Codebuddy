import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { BlogCategory } from './schema/blog-category.schema';

@Injectable()
export class BlogCategoryRepository extends BaseRepository<BlogCategory> {
  constructor(@InjectModel(BlogCategory.name) private readonly blogCategoryModel: Model<BlogCategory>) {
    super(blogCategoryModel);
  }

  async findById(blogCategoryId: string): Promise<BlogCategory> {
    return this.blogCategoryModel.findById(blogCategoryId);
  }
}