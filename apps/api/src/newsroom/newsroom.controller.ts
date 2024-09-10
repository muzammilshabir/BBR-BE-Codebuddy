import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsroomService } from './newsroom.service';
import { CreateNewsroomPostDto, createNewsroomPostDtoSchema } from './dto/create-newsroom-post.dto';
import { CreateNewsroomCategoryDto, createNewsroomCategoryDtoSchema } from './dto/create-newsroom-category.dto';
import { ListNewsroomPostsDto, listNewsroomPostsSchema } from './dto/list-posts.dto';
import { GetRelatedNewsroomPostsDto, getRelatedNewsroomPostsSchema } from './dto/get-related-newsroom-posts.dto';
import { Public } from '@bbr/api-core/modules/decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';

@ApiTags('Newsroom')
@Controller('newsroom')
export class NewsroomController {
  constructor(private readonly newsroomService: NewsroomService) {}

  @Post('/admin/create/post')
  @ApiOperation({
    summary: 'Create new Newsroom Post',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
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
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
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
  @Public()
  @UsePipes(new JoiValidationPipe(listNewsroomPostsSchema, 'query'))
  async listPosts(@Query() query: ListNewsroomPostsDto) {
    const posts = await this.newsroomService.listPosts(query);
    return ResponseService.buildResponse(posts);
  }

  @Get('/related')
  @ApiOperation({
    summary: 'Get Related Newsroom posts',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getRelatedNewsroomPostsSchema, 'query'))
  async getRelatedPosts(@Query() query: GetRelatedNewsroomPostsDto) {
    const posts = await this.newsroomService.getRelatedPosts(query);
    return ResponseService.buildResponse(posts);
  }
}
