import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankingCategoryDraftService } from './rankingCategoryDraft.service';
import { Controller, Get, Query, UsePipes, Param, Post } from '@nestjs/common';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  ListRankingCategoryDraftDto,
  listRankingCategoryDraftSchema,
} from './dto/listRankingCategoryDraft.dto';

import {
  GetRankingCategoryDraftByIdDto,
  getRankingCategoryDraftByIdSchema,
} from './dto/getRankingCategoryDraftById.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';

@ApiTags('RankingCategoryDraft')
@Controller('rankingCategory-draft')
export class RankingCategoryDraftController {
  constructor(private readonly rankingCategoryDraftService: RankingCategoryDraftService) {}
  @Get(':id')
  @ApiOperation({
    summary: 'Get ranking category Draft request by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.READ)
  @UsePipes(new JoiValidationPipe(getRankingCategoryDraftByIdSchema, 'param'))
  async getRankingCategoryDraftById(@Param() params: GetRankingCategoryDraftByIdDto) {
    const rankingCategoryDraftDetails =
      await this.rankingCategoryDraftService.getRankingCategoryDraftById(params.id);
    return ResponseService.buildResponse(
      { rankingCategoryDraftDetails },
      'Ranking category draft retrieved successfully'
    );
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Ranking Category Draft',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.READ)
  @UsePipes(new JoiValidationPipe(listRankingCategoryDraftSchema, 'query'))
  async listRankingCategoryDraft(
    @Query() listRankingCategoryDraftDto: ListRankingCategoryDraftDto
  ) {
    const result = await this.rankingCategoryDraftService.listRankingCategoryDraft(
      listRankingCategoryDraftDto
    );

    return ResponseService.buildResponse(
      { rankingCategoryDraft: result },
      'Ranking category draft retrieved successfully'
    );
  }

  @Post('/:id/approval-requests')
  @ApiOperation({
    summary: 'Submit a request for approval of a ranking category by rankingCategoryId',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('rankings', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getRankingCategoryDraftByIdSchema, 'param'))
  async createApprovalRequest(
    @GetCurrentUserId() userId: string,
    @Param() params: GetRankingCategoryDraftByIdDto
  ) {
    const rankingCategory = await this.rankingCategoryDraftService.createApprovalRequest(
      params.id,
      userId
    );
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking category draft retrieved successfully'
    );
  }
}
