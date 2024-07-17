import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostModel } from './post.model';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { ListPostDto } from './dto/listPost.dto';
import { Op, WhereOptions } from 'sequelize';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(PostModel)
    private postModel: typeof PostModel
  ) {}

  async findAll(listPostDto: ListPostDto) {
    const where: WhereOptions<PostModel> = {};

    if (listPostDto.search?.length) {
      where[Op.or] = [
        { title: { [Op.like]: `%${listPostDto.search}%` } },
        { content: { [Op.like]: `%${listPostDto.search}%` } },
      ];
    }

    const data = await this.postModel.findAndCountAll({
      where,
      ...PaginationService.prepareOptions(listPostDto),
    });

    const { pagination, data: posts } = PaginationService.paginate(data, listPostDto);

    return { pagination, posts };
  }

  async findOne(id: number) {
    const post = await this.postModel.findByPk(id);

    if (!post) {
      throw new NotFoundException('Post');
    }

    return post;
  }

  async create(createPostDto: CreatePostDto) {
    return await this.postModel.create(createPostDto);
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    await post.update(updatePostDto);

    return post;
  }

  async delete(id: number) {
    const post = await this.findOne(id);

    await post.destroy();

    return post;
  }
}
