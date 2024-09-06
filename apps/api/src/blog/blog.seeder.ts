import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { BlogRepository } from './blog.repository';
import { Types } from 'mongoose';
import { BlogCategoryRepository } from './blog-category.repository';

@Injectable()
export class BlogSeeder extends AbstractSeeder {
  public name = BlogSeeder.name;
  private readonly logger = new Logger(BlogSeeder.name);

  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly blogCategoryRepository: BlogCategoryRepository,
  ) {
    super();
  }

  async seed() {
    try {
      const blogsCategories = [
        {
          title: "Market Trends",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const categories = [];
      for (const category of blogsCategories) {
        categories.push(await this.blogCategoryRepository.upsert({ title: category.title }, category));
      }
      const blogsPosts = [
        {
          author: {
            name: "Nick Jameson",
            photo: new Types.ObjectId("66acda8b857c576159b74da2"),
          },
          title: "The Role of Technology in Modern Luxury Homes",
          category: categories[0]._id,
          featuredImage: new Types.ObjectId("66acda8b857c576159b742a2"),
          contents: "Lorem ipsum dolor sit ...",
          views: 0,
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
          views: 0,
          readTime: "2",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const post of blogsPosts) {
        await this.blogRepository.upsert({ title: post.title }, post);
      }
    } catch (error) {
      this.logger.error('Error seeding blogs', error);
    }
  }
}