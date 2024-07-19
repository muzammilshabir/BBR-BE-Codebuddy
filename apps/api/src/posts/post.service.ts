import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { ListPostDto } from './dto/listPost.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {}

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
    const data = await this.postModel
      .find(filter)
      .skip(options.offset)
      .limit(options.limit)
      .sort(options.sort)
      .exec();

    const count = await this.postModel.countDocuments(filter).exec();
    const { pagination } = PaginationService.paginate({ rows: data, count }, listPostDto);

    return { pagination, posts: data };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).exec();

    if (!post) {
      throw new NotFoundException('Post');
    }

    return post;
  }

  async create(createPostDto: CreatePostDto) {
    const createdPost = new this.postModel(createPostDto);
    return await createdPost.save();
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();

    if (!updatedPost) {
      throw new NotFoundException('Post');
    }

    return updatedPost;
  }

  async delete(id: string) {
    const deletedPost = await this.postModel.findByIdAndDelete(id).exec();

    if (!deletedPost) {
      throw new NotFoundException('Post');
    }

    return deletedPost;
  }
}
