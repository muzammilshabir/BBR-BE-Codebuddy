import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostModel } from './post.model';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [SequelizeModule.forFeature([PostModel])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
