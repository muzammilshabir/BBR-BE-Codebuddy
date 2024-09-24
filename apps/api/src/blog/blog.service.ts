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
import { GetRelatedBlogPostsDto } from './dto/get-related-blog-posts.dto';
import { GetPopularBlogPostsDto } from './dto/get-popular-blog-posts.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

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

  async getPostByIdAndUpdateView(postId: string): Promise<BlogPost> {
    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId}`);
    }
    
    this.blogRepository.update(postId, { views: post.views+1 });

    return post;
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

  async getRelatedPosts(getRelatedBlogPostsDto: GetRelatedBlogPostsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    const post = await this.blogRepository.findById(getRelatedBlogPostsDto.postId.toString());

    filter.category = post.category;
    filter._id = { "$ne": post._id };

    const { data } = await this.blogRepository.findAll(filter);
    return { posts: data };
  }

  async getPopularPosts(getPopularBlogPostsDto: GetPopularBlogPostsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      category: getPopularBlogPostsDto.categoryId,
    };

    const options = {
      limit: 5,
      offset: 0,
      sort: [['views', -1]],
    };

    const { data } = await this.blogRepository.findAll(filter, options);
    return { posts: data };
  }

}
