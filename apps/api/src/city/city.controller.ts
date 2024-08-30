import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListCityDto, listCitySchema } from './dto/listCity.dto';

@ApiTags('City')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @ApiOperation({
    summary: 'List all Cities',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listCitySchema, 'query'))
  async list(@Query() listCityDto: ListCityDto) {
    const data = await this.cityService.findAll(listCityDto);
    return ResponseService.buildResponse(data);
  }
}
