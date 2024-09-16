import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceDraftService } from './residencesDraft.service';
import { Controller, Get, Query, UsePipes, Param } from '@nestjs/common';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListResidenceDraftDto, listResidenceDraftSchema } from './dto/listResidenceDraft.dto';

import {
  GetResidenceDraftByIdDto,
  getResidenceDraftByIdSchema,
} from './dto/getResidenceDraftById.dto';

@ApiTags('ResidenceDraft')
@Controller('residence-draft')
export class ResidenceDraftController {
  constructor(private readonly residenceDraftService: ResidenceDraftService) {}
  @Get(':id')
  @ApiOperation({
    summary: 'Get Residence Draft request by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(getResidenceDraftByIdSchema, 'param'))
  async getResidenceDraftById(@Param() params: GetResidenceDraftByIdDto) {
    const residenceDraft = await this.residenceDraftService.getResidenceDraftById(params.id);
    return ResponseService.buildResponse({ residenceDraft }, 'Residence retrieved successfully');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Residence Draft',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listResidenceDraftSchema, 'query'))
  async listResidences(@Query() listResidenceDraftDto: ListResidenceDraftDto) {
    const result = await this.residenceDraftService.listResidencesDraft(listResidenceDraftDto);

    return ResponseService.buildResponse(
      { residencesDraft: result },
      'Residence retrieved successfully'
    );
  }
}
