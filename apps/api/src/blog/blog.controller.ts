import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, createBlogPostDtoSchema } from './dto/create-blog-post.dto';
import { CreateBlogCategoryDto, createBlogCategoryDtoSchema } from './dto/create-blog-category.dto';
import { ListBlogPostsDto, listBlogPostsSchema } from './dto/list-blog-posts.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('/admin/create/post')
  @ApiOperation({
    summary: 'Create new Blog Post',
  })
  @UsePipes(new JoiValidationPipe(createBlogPostDtoSchema, 'body'))
  async createPost(
    @Body() createBlogPostDto: CreateBlogPostDto,
    ) {
    const result = await this.blogService.createPost(createBlogPostDto);
    return ResponseService.buildResponse({ result }, 'Successfully created new Blog Post!');
  }

  @Post('/admin/create/category')
  @ApiOperation({
    summary: 'Create new Blog Category',
  })
  @UsePipes(new JoiValidationPipe(createBlogCategoryDtoSchema, 'body'))
  async createCategory(
    @Body() createBlogCategoryDto: CreateBlogCategoryDto,
    ) {
    const result = await this.blogService.createCategory(createBlogCategoryDto);
    return ResponseService.buildResponse({ result }, 'Successfully crated new Blog Category.');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Blog posts',
  })
  @UsePipes(new JoiValidationPipe(listBlogPostsSchema, 'query'))
  async listPosts(@Query() query: ListBlogPostsDto) {
    const posts = await this.blogService.listPosts(query);
    return ResponseService.buildResponse(posts);
  }
}
