import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyTypeService } from './propertyType.service';
import { PropertyTypeDto, propertyTypeSchema } from './dto/propertyType.dto';

@ApiTags('PropertyType')
@Controller('property-type')
export class PropertyTypeController {
  constructor(private readonly propertyTypeService: PropertyTypeService) {}

  @Get()
  @ApiOperation({
    summary: 'List all PropertyType',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(propertyTypeSchema, 'query'))
  async list(@Query() propertyTypeDto: PropertyTypeDto) {
    const data = await this.propertyTypeService.findAll(propertyTypeDto);
    return ResponseService.buildResponse(data);
  }
}
