import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostFixture } from './post.fixture';
import { FixtureReferenceService } from '@bbr/api-core/modules/fixture/fixtureReference.service';
import { PostModuleSeeder } from './post.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }])],
  providers: [PostService, PostRepository, PostFixture, FixtureReferenceService,PostModuleSeeder],
  exports: [PostFixture,PostModuleSeeder],
  controllers: [PostController],
})
export class PostModule {}
