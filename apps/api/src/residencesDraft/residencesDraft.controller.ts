import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceDraftService } from './residencesDraft.service';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListResidenceDraftDto, listResidenceDraftSchema } from './dto/listResidenceDraft.dto';

@ApiTags('ResidenceDraft')
@Controller('residence-draft')
export class ResidenceDraftController {
  constructor(private readonly residenceDraftService: ResidenceDraftService) {}

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
