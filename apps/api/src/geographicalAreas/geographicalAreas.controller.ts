import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  ListGeographicalAreasDto,
  listGeographicalAreasSchema,
} from './dto/listGeographicalAreas.dto';

import { GeographicalAreasService } from './geographicalAreas.service';
import { GetByIdDto, getIdSchema } from '../city/dto/getById.dto';

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

  @Get(':id')
  @ApiOperation({
    summary: 'Get GeographicalArea by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getIdSchema, 'param'))
  async getResidenceById(@Param() params: GetByIdDto) {
    const geographicalArea = await this.geographicalAreasService.getGeographicalAreaById(params.id);
    return ResponseService.buildResponse(
      { geographicalArea },
      'geographicalArea retrieved successfully'
    );
  }
}
