import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceTypeService } from './residenceType.service';
import { ListResidenceTypeDto, listResidenceTypeSchema } from './dto/listResidenceType.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateResidenceTypeDto, updateResidenceTypeSchema } from './dto/updateResidenceType.dto';

@ApiTags('ResidenceType')
@Controller('residence-type')
export class ResidenceTypeController {
  constructor(private readonly residenceTypeService: ResidenceTypeService) {}

  @Get()
  @ApiOperation({
    summary: 'List all residenceType',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listResidenceTypeSchema, 'query'))
  async list(@Query() listResidenceTypeDto: ListResidenceTypeDto) {
    const data = await this.residenceTypeService.findAll(listResidenceTypeDto);
    return ResponseService.buildResponse(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an ResidenceType by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateResidenceTypeSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateResidenceTypeDto: UpdateResidenceTypeDto) {
    const updatedResidenceType = await this.residenceTypeService.update(id, updateResidenceTypeDto);
    return ResponseService.buildResponse(updatedResidenceType);
  }
}
