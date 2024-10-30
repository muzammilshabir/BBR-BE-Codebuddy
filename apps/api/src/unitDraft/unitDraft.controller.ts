import { Controller, Delete, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnitDraftService } from './unitDraft.service';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListUnitDraftDto, listUnitDraftSchema } from './dto/listUnitDraft.dto';
import { GetUnitDraftByIdDto, getUnitDraftByIdSchema } from './dto/get-unitDraft-by-id.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('UnitDraft')
@Controller('unit-draft')
export class UnitDraftController {
  constructor(private readonly unitDraftService: UnitDraftService) {}

  @Get(':unitDraftId')
  @ApiOperation({
    summary: 'Get Unit draft request by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getUnitDraftByIdSchema, 'param'))
  async getUnitDraftById(@Param() params: GetUnitDraftByIdDto) {
    const unitDraft = await this.unitDraftService.getUnitDraftById(params.unitDraftId);
    return ResponseService.buildResponse(
      { unitDraft },
      'Unit draft request retrieved successfully'
    );
  }

  @Get('/')
  @ApiOperation({
    summary: 'List of Units draft request',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listUnitDraftSchema, 'query'))
  async listDraftUnits(@Query() listUnitDraftDto: ListUnitDraftDto) {
    const unitDraft = await this.unitDraftService.listDraftUnits(listUnitDraftDto);
    return ResponseService.buildResponse(
      { unitDraft },
      'Units draft request list retrieved successfully'
    );
  }

  @Delete(':unitDraftId')
  @ApiOperation({
    summary: 'Delete unitDraft by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.DELETE)
  @UsePipes(new JoiValidationPipe(getUnitDraftByIdSchema, 'param'))
  async deleteUnitDraft(@Param() params: GetUnitDraftByIdDto, @GetCurrentUserId() userId: string) {
    const unit = await this.unitDraftService.deleteUnitDraft(params.unitDraftId, userId);
    return ResponseService.buildResponse({ unit }, 'Unit Draft Deleted successfully');
  }
}
