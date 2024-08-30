import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { NewsroomRepository } from './newsroom.repository';
import { Types } from 'mongoose';
import { NewsroomCategoryRepository } from './newsroom-category.repository';

@Injectable()
export class NewsroomSeeder extends AbstractSeeder {
  public name = NewsroomSeeder.name;
  private readonly logger = new Logger(NewsroomSeeder.name);

  constructor(
    private readonly newsroomRepository: NewsroomRepository,
    private readonly newsroomCategoryRepository: NewsroomCategoryRepository,
  ) {
    super();
  }

  async seed() {
    try {
      const newsroomsCategories = [
        {
          title: "Technology & Innovation",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const categories = [];
      for (const category of newsroomsCategories) {
        categories.push(await this.newsroomCategoryRepository.upsert({ title: category.title }, category));
      }
      const newsroomsPosts = [
        {
          author: {
            name: "Nick Jameson",
            photo: new Types.ObjectId("66acda8b857c576159b74da2"),
          },
          title: "BBR providing open-source technology to promote fair housing in AI-powered real estate conversations",
          category: categories[0]._id,
          featuredImage: new Types.ObjectId("66acda8b857c576159b742a2"),
          contents: "Lorem ipsum dolor sit ...",
          readTime: "2",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          author: {
            name: "Nick Jameson",
            photo: new Types.ObjectId("66acda8b857c576159b74da1"),
          },
          title: "2nd Post",
          category: categories[0]._id,
          featuredImage: new Types.ObjectId("66acda8b857c576159b742a6"),
          contents: "Lorem ipsum dolor ...",
          readTime: "2",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const post of newsroomsPosts) {
        await this.newsroomRepository.upsert({ title: post.title }, post);
      }
    } catch (error) {
      this.logger.error('Error seeding newsrooms', error);
    }
  }
}