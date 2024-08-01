import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { PostRepository } from './post.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class PostModuleSeeder extends AbstractSeeder {
  public name = PostModuleSeeder.name;
  private readonly logger = new Logger(PostModuleSeeder.name);

  constructor(
    private readonly postRepository: PostRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super();
  }

  async seed() {
    try {
      // Ensure the MongoDB connection is established
      if (this.connection.readyState !== 1) {
        await this.connection.openUri(process.env.DB_URI);  // Use the appropriate URI for your environment
      }

      const posts = [
        {
          title: 'First Post harshal',
          content: 'This is the content of the first post.',
        },
        {
          title: 'Second Post harshal',
          content: 'This is the content of the second post.',
        },
      ];

      for (const post of posts) {
        await this.postRepository.create(post);
      }

    } catch (error) {
      this.logger.error('Error while seeding posts:', error);
    }
  }
}
