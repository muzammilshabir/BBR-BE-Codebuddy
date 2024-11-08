import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListCityDto, listCitySchema } from './dto/listCity.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { UpdateCityDto, updateCitySchema } from './dto/updateCity.dto';
import { GetByIdDto, getIdSchema } from './dto/getById.dto';

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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an City by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateCitySchema, 'body'))
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    const updatedCity = await this.cityService.update(id, updateCityDto);
    return ResponseService.buildResponse(updatedCity);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get City by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getIdSchema, 'param'))
  async getResidenceById(@Param() params: GetByIdDto) {
    const city = await this.cityService.getCityById(params.id);
    return ResponseService.buildResponse({ city }, 'city retrieved successfully');
  }
}
