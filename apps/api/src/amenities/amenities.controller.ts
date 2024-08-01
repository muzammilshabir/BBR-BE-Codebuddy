import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AmenityService } from './amenities.service';
import { ListAmenitiesDto, listAmenitiesSchema } from './dto/listAmenities.dto';

@ApiTags('Amenities')
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenityService: AmenityService) {}

  @Get()
  @ApiOperation({
    summary: 'List all amenities',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listAmenitiesSchema, 'query'))
  async list(@Query() listAmenitiesDto: ListAmenitiesDto) {
    const data = await this.amenityService.findAll(listAmenitiesDto);
    return ResponseService.buildResponse(data);
  }

}