import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceServicesService } from './residenceService.service';
import { ListResidenceServiceDto, listResidenceServiceSchema } from './dto/residenceService.dto';

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
}
