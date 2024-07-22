import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class PostFixture extends AbstractFixture {
  constructor(@InjectModel(Post.name) private readonly yourModel: Model<Post>) {
    super();
  }

  name = PostFixture.name;
  static TAG_1 = 'TAG_1';

  async load(): Promise<void> {
    const post1 = await this.yourModel.create({
      title: 'Post 1',
      content: 'Content 1',
    });
    this.addReference(PostFixture.TAG_1, post1);
  }
}
