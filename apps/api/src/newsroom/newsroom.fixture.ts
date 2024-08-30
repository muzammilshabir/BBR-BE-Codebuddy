import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { Newsroom } from './schema/newsroom.schema';
import { NewsroomCategory } from './schema/newsroom-category.schema';
import { UploadFixture } from 'src/upload/upload.fixture';

@Injectable()
export class NewsroomFixture extends AbstractFixture {
  public dependsOn = [
    UploadFixture,
  ];

  constructor(
    @InjectModel(Newsroom.name) private readonly newsroomModel: Model<Newsroom>,
    @InjectModel(NewsroomCategory.name) private readonly newsroomCategoryModel: Model<NewsroomCategory>,
  ) {
    super();
  }
  name = NewsroomFixture.name;
  static Newsroom_1 = 'NEWSROOM_1';
  static NewsroomCategory_1 = 'NEWSROOM_CATEGORY_1';
  async load() {
    // Create a new Newsroom Category document
    const newsroomCategory1 = await this.newsroomModel.create({
      title: "Technology & Innovation",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const photo = this.getReference(UploadFixture.UPLOAD_1)._id;
    const featuredImg = this.getReference(UploadFixture.UPLOAD_2)._id;
    // Create a new Newsroom document
    const newsroom1 = await this.newsroomModel.create({
      author: {
        name: "Nick Jameson",
        photo: photo,
      },
      title: "BBR Newsroom Post!",
      category: newsroomCategory1._id,
      featuredImage: featuredImg,
      contents: "Lorem ipsum dolor sit ...",
      readTime: "2",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    this.addReference(NewsroomFixture.NewsroomCategory_1, newsroomCategory1);
    this.addReference(NewsroomFixture.Newsroom_1, newsroom1);
  }
}
