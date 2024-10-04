import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceServicesService } from './residenceService.service';
import { ListResidenceServiceDto, listResidenceServiceSchema } from './dto/residenceService.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  UpdateResidenceServiceDto,
  updateResidenceServiceSchema,
} from './dto/updateResidenceService.dto';

@ApiTags('ResidenceService')
@Controller('residence-service')
export class ResidenceServiceController {
  constructor(private readonly residenceServicesService: ResidenceServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all ResidenceService',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listResidenceServiceSchema, 'query'))
  async list(@Query() listResidenceServiceDto: ListResidenceServiceDto) {
    const data = await this.residenceServicesService.findAll(listResidenceServiceDto);
    return ResponseService.buildResponse(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an ResidenceService by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateResidenceServiceSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateResidenceServiceDto: UpdateResidenceServiceDto
  ) {
    const updatedResidenceService = await this.residenceServicesService.update(
      id,
      updateResidenceServiceDto
    );
    return ResponseService.buildResponse(updatedResidenceService);
  }
}
