import { Injectable } from '@nestjs/common';
import { NewsroomRepository } from './newsroom.repository';
import { CreateNewsroomPostDto } from './dto/create-newsroom-post.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { Newsroom } from './schema/newsroom.schema';
import { Types } from 'mongoose';
import { CreateNewsroomCategoryDto } from './dto/create-newsroom-category.dto';
import { NewsroomCategory } from './schema/newsroom-category.schema';
import { NewsroomCategoryRepository } from './newsroom-category.repository';
import { ListNewsroomPostsDto } from './dto/list-posts.dto';
import { DeletionStatus } from 'src/unit/enum/unit-enum';
import { GetRelatedNewsroomPostsDto } from './dto/get-related-newsroom-posts.dto';

@Injectable()
export class NewsroomService {

  constructor(
    private readonly newsroomRepository: NewsroomRepository,
    private readonly newsroomCategoryRepository: NewsroomCategoryRepository,
  ) {}
  
  private calcReadingTime(text: string): string {
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    return time.toString();
  }


  async createPost(createNewsroomPostDto: CreateNewsroomPostDto): Promise<Newsroom> {
    const transformedDto = {
      ...createNewsroomPostDto,
      category: new Types.ObjectId(createNewsroomPostDto.category),
      featuredImage: new Types.ObjectId(createNewsroomPostDto.featuredImage),
      readTime: this.calcReadingTime(createNewsroomPostDto.contents),
    };
    transformedDto.author.photo = new Types.ObjectId(createNewsroomPostDto.author.photo);

    return this.newsroomRepository.create(transformedDto);
  }

  async createCategory(createNewsroomCategoryDto: CreateNewsroomCategoryDto): Promise<NewsroomCategory> {    
    return this.newsroomCategoryRepository.create(createNewsroomCategoryDto);
  }

  async listPosts(listNewsroomPostsDto: ListNewsroomPostsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if(listNewsroomPostsDto.search) {
      filter.$or = [
        { "newsroom.title": { $regex: listNewsroomPostsDto.search, $options: 'i' } },
        { "newsroom.contents": { $regex: listNewsroomPostsDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listNewsroomPostsDto);

    const { data, count } = await this.newsroomRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listNewsroomPostsDto);

    return { pagination, posts: data };
  }

  async getRelatedPosts(getRelatedNewsroomPostsDto: GetRelatedNewsroomPostsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    const post = await this.newsroomRepository.findById(getRelatedNewsroomPostsDto.postId.toString());

    filter.category = post.category;
    filter._id = { "$ne": post._id };

    const { data } = await this.newsroomRepository.findAll(filter);
    return { posts: data };
  }

}
