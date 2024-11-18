import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Get, Param, Patch, Post, Query, Res, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RankingRequestService } from './rankingRequest.service';
import { Response } from 'express';
import {
  RejectRankingRequestDto,
  rejectRankingRequestSchema,
} from './dto/reject-ranking-request.dto';
import {
  GetRankingRequestByIdDto,
  getRankingRequestByIdSchema,
} from './dto/get-ranking-request-by-id.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import {
  ListTop10RankedResidenceDto,
  listRankingRequestSchema,
  ListRankingRequestWithDraftDto,
  listTop10RankedResidenceDto,
  ListRankingRequestDto,
  ListRankingRequestForUserDto,
  listRankingRequestForUserSchema,
} from './dto/list-ranking-request.dto';
import {
  CreateRankingRequestDto,
  createRankingRequestSchema,
} from './dto/create-ranking-request.dto';
import {
  UpdateRankingRequestDto,
  updateRankingRequestSchema,
  UpdateRankingRequestStatusDto,
  updateRankingRequestStatusSchema,
} from './dto/update-ranking-request.dto';
import {
  ImproveRankingRequestDto,
  improveRankingRequestSchema,
} from './dto/improve-ranking-request.dto ';
import { ChangeRankingScoreDto, changeRankingScoreSchema } from './dto/change-ranking-score.dto';
import { Public } from '../auth/decorators/public.decorator';
import { PreviewRankingChangeDto, previewRankingChangeSchema } from './dto/preview-ranking-change.dto';

@ApiTags('RankingRequest')
@Controller('rankingRequest')
export class RankingRequestController {
  constructor(private readonly rankingRequestService: RankingRequestService) {}

  @Get('/with-draft')
  @ApiOperation({
    summary: 'List Ranking request with draft',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async listResidencesWithDraft(@Query() query: ListRankingRequestWithDraftDto) {
    const result = await this.rankingRequestService.listResidencesWithDraft(query);

    return ResponseService.buildResponse(result, 'Ranking Category retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ranking request by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER, UserRole.BUYER)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  async findRankingRequestById(@Param() params: GetRankingRequestByIdDto) {
    const rankingRequest = await this.rankingRequestService.findRankingRequestById(params.id);
    return ResponseService.buildResponse(
      { rankingRequest: rankingRequest },
      'Ranking request retrieved successfully'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ranking requests with filters and pagination',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER, UserRole.BUYER)
  @UsePipes(new JoiValidationPipe(listRankingRequestSchema, 'query'))
  async findAll(@Query() listRankingRequestDto: ListRankingRequestDto) {
    const rankingRequests = await this.rankingRequestService.findAll(listRankingRequestDto);
    return ResponseService.buildResponse(
      rankingRequests,
      'All ranking requests retrieved successfully'
    );
  }

  @Post('user/search')
  @ApiOperation({
    summary: 'Get all ranking requests with filters and pagination for users',
  })
  @ApiBearerAuth()
  @Public()
  @UsePipes(new JoiValidationPipe(listRankingRequestForUserSchema, 'body'))
  async findAllRankingRequestForUser(
    @Body() listRankingRequestForUserDto: ListRankingRequestForUserDto
  ) {
    const rankingRequests = await this.rankingRequestService.findAllRankingRequestForUser(
      listRankingRequestForUserDto
    );
    return ResponseService.buildResponse(
      rankingRequests,
      'All ranking requests retrieved successfully'
    );
  }

  @Get('residence/top-10-ranked-residence')
  @ApiOperation({
    summary: 'Get top 10 ranked residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listTop10RankedResidenceDto, 'query'))
  async getTop10ResidencesBasedOnViews(
    @Query() listTop10RankedResidenceDto: ListTop10RankedResidenceDto,
    @Res() res: Response
  ) {
    const result = await this.rankingRequestService.getTop10ResidencesBasedOnViews(
      listTop10RankedResidenceDto
    );
    if (listTop10RankedResidenceDto.isDownload) {
      if (listTop10RankedResidenceDto.fileType === 'csv') {
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=top10residences.csv');
        return res.send(result);
      } else if (listTop10RankedResidenceDto.fileType === 'excel') {
        res.header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.header('Content-Disposition', 'attachment; filename=top10residences.xlsx');
        return res.send(result);
      }
    }
    return res.json(
      ResponseService.buildResponse(result, 'Top 10 ranked residences retrieved successfully')
    );
  }

  @Post('ranking/change-ranking-score')
  @ApiOperation({
    summary: 'Change ranking of ranking request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(changeRankingScoreSchema, 'body'))
  async adjustRankingAndCriteria(@Body() changeRankingScoreDto: ChangeRankingScoreDto) {
    const rankingRequests = await this.rankingRequestService.adjustRankingAndCriteria(
      changeRankingScoreDto.newPosition,
      changeRankingScoreDto.rankingRequestId.toString(),
      changeRankingScoreDto.changeRankingScore
    );
    return ResponseService.buildResponse(
      { rankingRequests: rankingRequests },
      'Ranking score changed successfully'
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create ranking request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createRankingRequestSchema, 'body'))
  async create(
    @Body() createRankingRequestDto: CreateRankingRequestDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingCategory = await this.rankingRequestService.create(createRankingRequestDto, user);
    return ResponseService.buildResponse(
      { rankingCategory },
      'Ranking request created successfully'
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ranking request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateRankingRequestSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateRankingRequestDto: UpdateRankingRequestDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingRequest = await this.rankingRequestService.update(
      id,
      user,
      updateRankingRequestDto
    );
    return ResponseService.buildResponse(
      { rankingRequest },
      'Ranking request updated successfully'
    );
  }

  @Patch('improve/:id')
  @ApiOperation({
    summary: 'Improve ranking request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(improveRankingRequestSchema, 'body'))
  async improveRankingRequest(
    @Param('id') id: string,
    @Body() improveRankingRequestDto: ImproveRankingRequestDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const rankingRequest = await this.rankingRequestService.improveRankingRequest(
      id,
      user,
      improveRankingRequestDto
    );
    return ResponseService.buildResponse(
      { rankingRequest },
      'Ranking request for improvement created successfully'
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a ranking request' })
  @Patch(':id/approve')
  // TODO: This API should only be accessible to super admin.
  // After a super admin is created, change the role to super admin.
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  async approveRankingRequest(
    @Param() Param: GetRankingRequestByIdDto,
    @GetCurrentUserId() userId: string
  ) {
    const rankingRequest = await this.rankingRequestService.approveRankingRequest(Param.id, userId);

    return ResponseService.buildResponse(
      { rankingRequest },
      'Ranking request approved successfully'
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a ranking request' })
  @Patch(':id/reject')
  // TODO: This API should only be accessible to super admin.
  // After a super admin is created, change the role to super admin.
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(rejectRankingRequestSchema, 'body'))
  async rejectRankingCategory(
    @Param() Param: GetRankingRequestByIdDto,
    @GetCurrentUserId() userId: string,
    @Body() rejectRankingRequestDto: RejectRankingRequestDto
  ) {
    const rankingRequest = await this.rankingRequestService.rejectRankingRequest(
      Param.id,
      userId,
      rejectRankingRequestDto
    );

    return ResponseService.buildResponse(
      { rankingRequest },
      'Ranking request Rejected successfully'
    );
  }

  @Patch('/:id/update-status')
  @ApiOperation({
    summary: 'Update Ranking request Status',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(updateRankingRequestStatusSchema, 'body'))
  async updateRankingCategoryStatus(
    @GetCurrentUserId() userId: string,
    @Param() params: GetRankingRequestByIdDto,
    @Body() updateRankingRequestStatusDto: UpdateRankingRequestStatusDto
  ) {
    const updatedRankingRequest = await this.rankingRequestService.updateRankingRequestStatus(
      params.id,
      userId,
      updateRankingRequestStatusDto
    );
    return ResponseService.buildResponse(
      { updatedRankingRequest },
      'Ranking request status updated successfully'
    );
  }

  @Patch('/:id/unarchive')
  @ApiOperation({
    summary: 'Update Ranking request Status unarchive',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getRankingRequestByIdSchema, 'param'))
  async unarchiveRankingCategory(
    @GetCurrentUserId() userId: string,
    @Param() params: GetRankingRequestByIdDto
  ) {
    const updatedRankingRequest = await this.rankingRequestService.unarchiveRankingRequest(
      params.id,
      userId
    );
    return ResponseService.buildResponse(
      { updatedRankingRequest },
      'Ranking request status unarchived successfully'
    );
  }

  @Post('preview-ranking-change')
  @ApiOperation({
    summary: 'Preview ranking change before applying',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(previewRankingChangeSchema, 'body'))
  async previewRankingChange(@Body() previewRankingChangeDto: PreviewRankingChangeDto) {
    const preview = await this.rankingRequestService.previewRankingChange(
      previewRankingChangeDto.newPosition,
      previewRankingChangeDto.rankingRequestId.toString(),
      previewRankingChangeDto.changeRankingScore
    );
    
    return ResponseService.buildResponse(
      preview,
      'Ranking change preview generated successfully'
    );
  }
}
