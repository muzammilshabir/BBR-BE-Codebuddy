import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto, createPostSchema } from './dto/createPost.dto';
import { GetSinglePostDto, getSinglePostSchema } from './dto/getSinglePost.dto';
import { UpdatePostDto, updatePostSchema } from './dto/updatePost.dto';
import { ListPostDto, listPostSchema } from './dto/listPost.dto';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({
    summary: 'List all posts',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listPostSchema, 'query'))
  async list(@Query() listPostDto: ListPostDto) {
    const data = await this.postService.findAll(listPostDto);
    return ResponseService.buildResponse(data);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single post',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getSinglePostSchema, 'param'))
  async getOne(@Param() getSingleBookDto: GetSinglePostDto) {
    const post = await this.postService.findOne(getSingleBookDto.id);
    return ResponseService.buildResponse({ post });
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new post',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(createPostSchema, 'body'))
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.postService.create(createPostDto);
    return ResponseService.buildResponse({ post }, 'Post created successfully');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a post',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(updatePostSchema, 'body'))
  async update(@Param() getSingleBookDto: GetSinglePostDto, @Body() updatePostDto: UpdatePostDto) {
    const post = await this.postService.update(getSingleBookDto.id, updatePostDto);
    return ResponseService.buildResponse({ post }, 'Post created successfully');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a post',
  })
  @Public()
  async delete(@Param() getSingleBookDto: GetSinglePostDto) {
    const post = await this.postService.delete(getSingleBookDto.id);
    return ResponseService.buildResponse({ post }, 'Post deleted successfully');
  }
}
