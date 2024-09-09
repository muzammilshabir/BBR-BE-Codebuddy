import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BlogPost, BlogPostSchema } from './schema/blog-post.schema';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogRepository } from './blog.repository';
import { BlogSeeder } from './blog.seeder';
import { BlogFixture } from './blog.fixture';
import { UserModule } from 'src/users/user.module';
import { BlogCategory, BlogCategorySchema } from './schema/blog-category.schema';
import { BlogCategoryRepository } from './blog-category.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    MongooseModule.forFeature([{ name: BlogPost.name, schema: BlogPostSchema }]),
    MongooseModule.forFeature([{ name: BlogCategory.name, schema: BlogCategorySchema }]),
  ],
  providers: [
    BlogService,
    BlogRepository,
    BlogCategoryRepository,
    BlogSeeder,
    BlogFixture,
  ],
  exports: [BlogSeeder, BlogFixture],
  controllers: [BlogController],
})
export class BlogModule {}