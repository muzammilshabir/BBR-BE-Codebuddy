import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
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
  UpdateRankingCategoryStatusDto,
  updateRankingCategoryStatusSchema,
} from './dto/update-ranking-category.dto';
import {
  PublicRankingCategoryListDto,
  RankingCategoryListDto,
  rankingCategorySchema,
} from './dto/list-ranking-category.dto';
import {
  RejectRankingCategoryDto,
  rejectRankingCategorySchema,
} from './dto/reject-ranking-category.dto';
import {
  GetRankingCategoryByIdDto,
  getRankingCategoryByIdSchema,
} from './dto/get-ranking-category-by-id.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('RankingCategory')
@Controller('rankingCategory')
export class RankingCategoryController {
  constructor(private readonly rankingCategoryService: RankingCategoryService) {}

  @Get('/with-draft')
  @ApiOperation({
    summary: 'List Ranking category with draft',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.READ)
  async listResidencesWithDraft(@Query() query: RankingCategoryListDto) {
    const result = await this.rankingCategoryService.listResidencesWithDraft(query);

    return ResponseService.buildResponse(result, 'Ranking Category retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ranking category by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getRankingCategoryByIdSchema, 'param'))
  async findRankingCategory(
    @Param() params: GetRankingCategoryByIdDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingCategory = await this.rankingCategoryService.findRankingCategory(params.id, user);
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category retrieved successfully'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ranking categories with filters and pagination',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(rankingCategorySchema, 'query'))
  async getAllRankingCategories(
    @Query() rankingCategoryDto: RankingCategoryListDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const result = await this.rankingCategoryService.findAll(rankingCategoryDto, user);
    return ResponseService.buildResponse(result, 'All ranking categories retrieved successfully');
  }

  @Get('active/public')
  @ApiOperation({
    summary: 'Get all active ranking categories with filters and pagination',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(rankingCategorySchema, 'query'))
  async getAllRankingCategoriesForPublic(
    @Query() rankingCategoryDto: PublicRankingCategoryListDto
  ) {
    const result = await this.rankingCategoryService.findAllPublic(rankingCategoryDto);
    return ResponseService.buildResponse(
      result,
      'All active ranking categories retrieved successfully'
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create ranking category',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.EDIT)
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
  @Permissions('rankings', PermissionLevel.EDIT)
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a ranking category' })
  @Patch(':id/approve')
  // TODO: This API should only be accessible to super admin.
  // After a super admin is created, change the role to super admin.
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getRankingCategoryByIdSchema, 'param'))
  async approveRankingCategory(
    @Param() Param: GetRankingCategoryByIdDto,
    @GetCurrentUserId() userId: string
  ) {
    const rankingCategory = await this.rankingCategoryService.approveRankingCategory(
      Param.id,
      userId
    );

    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category approved successfully'
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a ranking category' })
  @Patch(':id/reject')
  // TODO: This API should only be accessible to super admin.
  // After a super admin is created, change the role to super admin.
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getRankingCategoryByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(rejectRankingCategorySchema, 'body'))
  async rejectRankingCategory(
    @Param() Param: GetRankingCategoryByIdDto,
    @GetCurrentUserId() userId: string,
    @Body() rejectRankingCategoryDto: RejectRankingCategoryDto
  ) {
    const rankingCategory = await this.rankingCategoryService.rejectRankingCategory(
      Param.id,
      userId,
      rejectRankingCategoryDto
    );

    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category Rejected successfully'
    );
  }

  @Patch('/:id/update-status')
  @ApiOperation({
    summary: 'Update Ranking category Status',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getRankingCategoryByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(updateRankingCategoryStatusSchema, 'body'))
  async updateRankingCategoryStatus(
    @GetCurrentUserId() userId: string,
    @Param() params: GetRankingCategoryByIdDto,
    @Body() updateRankingCategoryStatusDto: UpdateRankingCategoryStatusDto
  ) {
    const updatedRankingCategory = await this.rankingCategoryService.updateRankingCategoryStatus(
      params.id,
      userId,
      updateRankingCategoryStatusDto
    );
    return ResponseService.buildResponse(
      { updatedRankingCategory },
      'Ranking category status updated successfully'
    );
  }

  @Patch('/:id/unarchive')
  @ApiOperation({
    summary: 'Update Ranking category Status unarchive',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getRankingCategoryByIdSchema, 'param'))
  async unarchiveRankingCategory(
    @GetCurrentUserId() userId: string,
    @Param() params: GetRankingCategoryByIdDto
  ) {
    const updatedRankingCategory = await this.rankingCategoryService.unarchiveRankingCategory(
      params.id,
      userId
    );
    return ResponseService.buildResponse(
      { updatedRankingCategory },
      'Ranking category status unarchived successfully'
    );
  }
}
