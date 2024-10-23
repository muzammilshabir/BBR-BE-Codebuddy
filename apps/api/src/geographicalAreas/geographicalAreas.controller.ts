import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  ListGeographicalAreasDto,
  listGeographicalAreasSchema,
} from './dto/listGeographicalAreas.dto';

import { GeographicalAreasService } from './geographicalAreas.service';

@ApiTags('GeographicalAreas')
@Controller('geographical-areas')
export class GeographicalAreasController {
  constructor(private readonly geographicalAreasService: GeographicalAreasService) {}

  @Get()
  @ApiOperation({
    summary: 'List all GeographicalAreas',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listGeographicalAreasSchema, 'query'))
  async list(@Query() listGeographicalAreasDto: ListGeographicalAreasDto) {
    const data = await this.geographicalAreasService.findAll(listGeographicalAreasDto);
    return ResponseService.buildResponse(data);
  }
}
