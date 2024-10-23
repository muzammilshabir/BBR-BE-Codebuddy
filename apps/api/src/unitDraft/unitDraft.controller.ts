import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
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

@ApiTags('UnitDraft')
@Controller('unit-draft')
export class UnitDraftController {
  constructor(private readonly unitDraftService: UnitDraftService) {}

  @Get(':unitDraftId')
  @ApiOperation({
    summary: 'Get Unit draft request by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.READ)
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
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.READ)
  @UsePipes(new JoiValidationPipe(listUnitDraftSchema, 'query'))
  async listDraftUnits(@Query() listUnitDraftDto: ListUnitDraftDto) {
    const unitDraft = await this.unitDraftService.listDraftUnits(listUnitDraftDto);
    return ResponseService.buildResponse(
      { unitDraft },
      'Units draft request list retrieved successfully'
    );
  }
}
