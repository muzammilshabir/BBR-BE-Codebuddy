import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceTypeService } from './residenceType.service';
import { ListResidenceTypeDto, listResidenceTypeSchema } from './dto/listResidenceType.dto';

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

}