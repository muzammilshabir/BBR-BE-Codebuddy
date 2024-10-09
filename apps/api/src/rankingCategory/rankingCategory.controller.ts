import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RankingCategoryService } from './rankingCategory.service';
import {
  CreateRankingCategoryDto,
  createRankingCategorySchema,
} from './dto/create-ranking-category.dto';
import {
  UpdateRankingCategoryDto,
  updateRankingCategorySchema,
} from './dto/update-ranking-category.dto';
import { RankingCategoryListDto, rankingCategorySchema } from './dto/list-ranking-category.dto';
import {
  RejectRankingCategoryDto,
  rejectRankingCategorySchema,
} from './dto/reject-ranking-category.dto';

@ApiTags('RankingCategory')
@Controller('rankingCategory')
export class RankingCategoryController {
  constructor(private readonly rankingCategoryService: RankingCategoryService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get ranking category by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async findRankingCategory(@Param('id') id: string, @GetCurrentUser() user: JwtPayloadType) {
    const rankingCategory = await this.rankingCategoryService.findRankingCategory(id, user);
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category retrieved successfully'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ranking categories with filters and pagination',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(rankingCategorySchema, 'query'))
  async getAllRankingCategories(
    @Query() rankingCategoryDto: RankingCategoryListDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingCategories = await this.rankingCategoryService.findAll(rankingCategoryDto, user);
    return ResponseService.buildResponse(
      { rankingCategories },
      'All ranking categories retrieved successfully'
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create ranking category',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createRankingCategorySchema, 'body'))
  async create(
    @Body() createRankingCategoryDto: CreateRankingCategoryDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingCategory = await this.rankingCategoryService.create(
      createRankingCategoryDto,
      user
    );
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category created successfully'
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ranking category',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateRankingCategorySchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateRankingCategoryDto: UpdateRankingCategoryDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingCategory = await this.rankingCategoryService.update(
      id,
      user,
      updateRankingCategoryDto
    );
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category updated successfully'
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete ranking category',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @GetCurrentUser() user: JwtPayloadType) {
    const rankingCategory = await this.rankingCategoryService.delete(id, user);
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category deleted successfully'
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a ranking category' })
  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  async approveRankingCategory(@Param('id') id: string) {
    const rankingCategory = await this.rankingCategoryService.approveRankingCategory(id);

    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category approved successfully'
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a ranking category' })
  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(rejectRankingCategorySchema, 'body'))
  async rejectRankingCategory(
    @Param('id') id: string,
    @Body() rejectRankingCategoryDto: RejectRankingCategoryDto
  ) {
    const rankingCategory = await this.rankingCategoryService.rejectRankingCategory(
      id,
      rejectRankingCategoryDto
    );

    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category Rejected successfully'
    );
  }
}
