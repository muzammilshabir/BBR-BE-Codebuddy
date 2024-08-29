import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsroomService } from './newsroom.service';
import { CreateNewsroomPostDto, createNewsroomPostDtoSchema } from './dto/create-newsroom-post.dto';
import { CreateNewsroomCategoryDto, createNewsroomCategoryDtoSchema } from './dto/create-newsroom-category.dto';
import { ListNewsroomPostsDto, listNewsroomPostsSchema } from './dto/list-posts.dto';

@ApiTags('Newsroom')
@Controller('newsroom')
export class NewsroomController {
  constructor(private readonly newsroomService: NewsroomService) {}

  @Post('/admin/create/post')
  @ApiOperation({
    summary: 'Create new Newsroom Post',
  })
  @UsePipes(new JoiValidationPipe(createNewsroomPostDtoSchema, 'body'))
  async createPost(
    @Body() createNewsroomPostDto: CreateNewsroomPostDto,
    ) {
    const result = await this.newsroomService.createPost(createNewsroomPostDto);
    return ResponseService.buildResponse({ result }, 'Successfully created new Press Release!');
  }

  @Post('/admin/create/category')
  @ApiOperation({
    summary: 'Create new Newsroom Category',
  })
  @UsePipes(new JoiValidationPipe(createNewsroomCategoryDtoSchema, 'body'))
  async createCategory(
    @Body() createNewsroomCategoryDto: CreateNewsroomCategoryDto,
    ) {
    const result = await this.newsroomService.createCategory(createNewsroomCategoryDto);
    return ResponseService.buildResponse({ result }, 'Successfully crated new Newsroom Category.');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Newsroom posts',
  })
  @UsePipes(new JoiValidationPipe(listNewsroomPostsSchema, 'query'))
  async listReviews(@Query() query: ListNewsroomPostsDto) {
    const posts = await this.newsroomService.listPosts(query);
    return ResponseService.buildResponse(posts);
  }
}
