import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost } from './schema/blog-post.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class BlogRepository extends BaseRepository<BlogPost> {
  constructor(@InjectModel(BlogPost.name) private readonly blogModel: Model<BlogPost>) {
    super(blogModel);
  }

  async findById(blogPostId: string): Promise<BlogPost> {
    return this.blogModel.findById(blogPostId);
  }
}