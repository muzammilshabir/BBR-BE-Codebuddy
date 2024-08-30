import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountryService } from './country.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListCountryDto, listCountrySchema } from './dto/listCountry.dto';

@ApiTags('Country')
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({
    summary: 'List all country',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listCountrySchema, 'query'))
  async list(@Query() listCountryDto: ListCountryDto) {
    const data = await this.countryService.findAll(listCountryDto);
    return ResponseService.buildResponse(data);
  }
}
