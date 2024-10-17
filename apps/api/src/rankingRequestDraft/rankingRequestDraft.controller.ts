import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankingRequestDraftService } from './rankingRequestDraft.service';
import { Controller, Get, Query, UsePipes, Param, Post } from '@nestjs/common';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  ListRankingRequestDraftDto,
  listRankingRequestDraftSchema,
} from './dto/listRankingRequestDraft.dto';

import {
  GetRankingRequestDraftByIdDto,
  getRankingRequestByIdSchema,
} from './dto/getRankingRequestDrafById.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';

@ApiTags('RankingRequestDraft')
@Controller('rankingRequest-draft')
export class RankingRequestDraftController {
  constructor(private readonly rankingRequestDraftService: RankingRequestDraftService) {}
  @Get(':id')
  @ApiOperation({
    summary: 'Get ranking Request Draft request by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  async getRankingRequestDraftById(@Param() params: GetRankingRequestDraftByIdDto) {
    const rankingRequestDraftDetails =
      await this.rankingRequestDraftService.getRankingRequestDraftById(params.id);
    return ResponseService.buildResponse(
      { rankingRequestDraftDetails: rankingRequestDraftDetails },
      'Ranking Request draft retrieved successfully'
    );
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Ranking Request Draft',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listRankingRequestDraftSchema, 'query'))
  async listRankingRequestDraft(@Query() listRankingRequestDraftDto: ListRankingRequestDraftDto) {
    const result = await this.rankingRequestDraftService.listRankingRequestDraft(
      listRankingRequestDraftDto
    );

    return ResponseService.buildResponse(
      { rankingRequestDraft: result },
      'Ranking request draft retrieved successfully'
    );
  }

  @Post('/:id/approval-requests')
  @ApiOperation({
    summary: 'Submit a request for approval of a ranking request by rankingRequestId',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  async createApprovalRequest(
    @GetCurrentUserId() userId: string,
    @Param() params: GetRankingRequestDraftByIdDto
  ) {
    const rankingRequest = await this.rankingRequestDraftService.createApprovalRequest(
      params.id,
      userId
    );
    return ResponseService.buildResponse(
      { rankingRequest: rankingRequest },
      'Ranking request draft retrieved successfully'
    );
  }
}
