import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { BlogPost } from './schema/blog-post.schema';
import { BlogCategory } from './schema/blog-category.schema';
import { UploadFixture } from 'src/upload/upload.fixture';

@Injectable()
export class BlogFixture extends AbstractFixture {
  public dependsOn = [
    UploadFixture,
  ];

  constructor(
    @InjectModel(BlogPost.name) private readonly blogModel: Model<BlogPost>,
    @InjectModel(BlogCategory.name) private readonly blogCategoryModel: Model<BlogCategory>,
  ) {
    super();
  }
  name = BlogFixture.name;
  static Blog_1 = 'BLOG_1';
  static BlogCategory_1 = 'BLOG_CATEGORY_1';
  async load() {
    // Create a new Blog Category document
    const blogCategory1 = await this.blogCategoryModel.create({
      title: "Market Trends",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const photo = this.getReference(UploadFixture.UPLOAD_1)._id;
    const featuredImg = this.getReference(UploadFixture.UPLOAD_2)._id;
    // Create a new Blog document
    const blog1 = await this.blogModel.create({
      author: {
        name: "Nick Jameson",
        photo: photo,
      },
      title: "The Benefits of Living in a Gated Community!",
      category: blogCategory1._id,
      featuredImage: featuredImg,
      contents: "Lorem ipsum dolor sit ...",
      readTime: "2",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    this.addReference(BlogFixture.BlogCategory_1, blogCategory1);
    this.addReference(BlogFixture.Blog_1, blog1);
  }
}
