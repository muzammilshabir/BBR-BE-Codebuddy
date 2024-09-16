import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnitDraftService } from './unitDraft.service';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUnitByIdDto, getUnitByIdSchema } from '../unit/dto/get-unit-by-id.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListUnitDraftDto, listUnitDraftSchema } from './dto/listUnitDraft.dto';

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
  @UsePipes(new JoiValidationPipe(getUnitByIdSchema, 'param'))
  async getUnitDraftById(@Param() params: GetUnitByIdDto) {
    const unitDraft = await this.unitDraftService.getUnitDraftById(params.unitId);
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
  @UsePipes(new JoiValidationPipe(listUnitDraftSchema, 'query'))
  async listDraftUnits(@Query() listUnitDraftDto: ListUnitDraftDto) {
    const unitDraft = await this.unitDraftService.listDraftUnits(listUnitDraftDto);
    return ResponseService.buildResponse(
      { unitDraft },
      'Units draft request list retrieved successfully'
    );
  }
}
