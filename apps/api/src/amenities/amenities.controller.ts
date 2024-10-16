import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AmenityService } from './amenities.service';
import { ListAmenitiesDto, listAmenitiesSchema } from './dto/listAmenities.dto';
import { UpdateAmenityDto, updateAmenitySchema } from './dto/updateAmenities.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an amenity by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateAmenitySchema, 'body'))
  async update(@Param('id') id: string, @Body() updateAmenityDto: UpdateAmenityDto) {
    const updatedAmenity = await this.amenityService.update(id, updateAmenityDto);
    return ResponseService.buildResponse(updatedAmenity);
  }
}
