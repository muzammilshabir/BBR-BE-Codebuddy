import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { ListLocationDto, listLocationSchema } from './dto/listlocation.dto';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiOperation({
    summary: 'List all location',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listLocationSchema, 'query'))
  async list(@Query() listLocationDto: ListLocationDto) {
    const data = await this.locationService.findAll(listLocationDto);
    return ResponseService.buildResponse(data);
  }

}