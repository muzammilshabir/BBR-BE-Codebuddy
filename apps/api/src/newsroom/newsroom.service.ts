import { Injectable } from '@nestjs/common';
import { NewsroomRepository } from './newsroom.repository';
import { CreateNewsroomPostDto } from './dto/create-newsroom-post.dto';
import { Newsroom } from './schema/newsroom.schema';
import { Types } from 'mongoose';
import { CreateNewsroomCategoryDto } from './dto/create-newsroom-category.dto';
import { NewsroomCategory } from './schema/newsroom-category.schema';
import { NewsroomCategoryRepository } from './newsroom-category.repository';

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

}
