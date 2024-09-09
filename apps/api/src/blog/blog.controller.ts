import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, createBlogPostDtoSchema } from './dto/create-blog-post.dto';
import { CreateBlogCategoryDto, createBlogCategoryDtoSchema } from './dto/create-blog-category.dto';
import { ListBlogPostsDto, listBlogPostsSchema } from './dto/list-blog-posts.dto';
import { GetRelatedBlogPostsDto, getRelatedBlogPostsSchema } from './dto/get-related-blog-posts.dto';
import { GetPopularBlogPostsDto, getPopularBlogPostsSchema } from './dto/get-popular-blog-posts.dto';
import { GetBlogPostByIdDto, getBlogPostByIdSchema } from './dto/get-blog-post-by-id.dto';

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

  @Get('/:postId')
  @ApiOperation({
    summary: 'Get Blog post by Id',
  })
  @UsePipes(new JoiValidationPipe(getBlogPostByIdSchema, 'param'))
  async getPostById(@Param() params: GetBlogPostByIdDto) {
    const posts = await this.blogService.getPostByIdAndUpdateView(params.postId);
    return ResponseService.buildResponse(posts);
  }

  @Get('/related')
  @ApiOperation({
    summary: 'Get Related Blog posts',
  })
  @UsePipes(new JoiValidationPipe(getRelatedBlogPostsSchema, 'query'))
  async getRelatedPosts(@Query() query: GetRelatedBlogPostsDto) {
    const posts = await this.blogService.getRelatedPosts(query);
    return ResponseService.buildResponse(posts);
  }

  @Get('/popular')
  @ApiOperation({
    summary: 'Get Popular Blog posts',
  })
  @UsePipes(new JoiValidationPipe(getPopularBlogPostsSchema, 'query'))
  async getPopularPosts(@Query() query: GetPopularBlogPostsDto) {
    const posts = await this.blogService.getPopularPosts(query);
    return ResponseService.buildResponse(posts);
  }
}
