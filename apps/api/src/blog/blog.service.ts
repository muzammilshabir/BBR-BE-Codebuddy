import { Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { BlogPost } from './schema/blog-post.schema';
import { Types } from 'mongoose';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { BlogCategory } from './schema/blog-category.schema';
import { BlogCategoryRepository } from './blog-category.repository';
import { ListBlogPostsDto } from './dto/list-blog-posts.dto';
import { DeletionStatus } from 'src/unit/enum/unit-enum';

@Injectable()
export class BlogService {

  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly blogCategoryRepository: BlogCategoryRepository,
  ) {}
  
  private calcReadingTime(text: string): string {
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    return time.toString();
  }


  async createPost(createBlogPostDto: CreateBlogPostDto): Promise<BlogPost> {
    const transformedDto = {
      ...createBlogPostDto,
      category: new Types.ObjectId(createBlogPostDto.category),
      featuredImage: new Types.ObjectId(createBlogPostDto.featuredImage),
      readTime: this.calcReadingTime(createBlogPostDto.contents),
    };
    transformedDto.author.photo = new Types.ObjectId(createBlogPostDto.author.photo);

    return this.blogRepository.create(transformedDto);
  }

  async createCategory(createBlogCategoryDto: CreateBlogCategoryDto): Promise<BlogCategory> {    
    return this.blogCategoryRepository.create(createBlogCategoryDto);
  }

  async listPosts(listBlogPostsDto: ListBlogPostsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if(listBlogPostsDto.search) {
      filter.$or = [
        { "blog.title": { $regex: listBlogPostsDto.search, $options: 'i' } },
        { "blog.contents": { $regex: listBlogPostsDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listBlogPostsDto);

    const { data, count } = await this.blogRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBlogPostsDto);

    return { pagination, posts: data };
  }

}
