import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { ListPostDto } from './dto/listPost.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(listPostDto: ListPostDto) {
    const filter = listPostDto.search
      ? {
          $or: [
            { title: { $regex: listPostDto.search, $options: 'i' } },
            { content: { $regex: listPostDto.search, $options: 'i' } },
          ],
        }
      : {};

    const options = PaginationService.prepareOptions(listPostDto);

    const { data, count } = await this.postRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listPostDto);

    return { pagination, posts: data };
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException('Post');
    }
    return post;
  }

  async create(createPostDto: CreatePostDto) {
    return await this.postRepository.create(createPostDto);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const updatedPost = await this.postRepository.update(id, updatePostDto);
    if (!updatedPost) {
      throw new NotFoundException('Post');
    }
    return updatedPost;
  }

  async delete(id: string) {
    const post = await this.postRepository.delete(id);
    if (!post) {
      throw new NotFoundException('Post');
    }
    return post;
  }
}
