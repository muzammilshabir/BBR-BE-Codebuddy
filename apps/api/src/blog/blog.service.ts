import { Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { BlogCategoryRepository } from './blog-category.repository';

@Injectable()
export class BlogService {

  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly blogCategoryRepository: BlogCategoryRepository,
  ) {}

}
