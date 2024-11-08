import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyTypeService } from './propertyType.service';
import { PropertyTypeDto, propertyTypeSchema } from './dto/propertyType.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdatePropertyTypeDto, updatePropertyTypeSchema } from './dto/updatePropertyType.dto';
import { GetByIdDto, getIdSchema } from '../city/dto/getById.dto';

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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an PropertyType by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updatePropertyTypeSchema, 'body'))
  async update(@Param('id') id: string, @Body() updatePropertyTypeDto: UpdatePropertyTypeDto) {
    const updatedPropertyType = await this.propertyTypeService.update(id, updatePropertyTypeDto);
    return ResponseService.buildResponse(updatedPropertyType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get PropertyType by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getIdSchema, 'param'))
  async getResidenceById(@Param() params: GetByIdDto) {
    const propertyType = await this.propertyTypeService.getPropertyTypeById(params.id);
    return ResponseService.buildResponse({ propertyType }, 'propertyType retrieved successfully');
  }
}
