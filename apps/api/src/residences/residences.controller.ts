import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceService } from './residences.service';
import { CreateResidenceDto, createResidenceSchema } from './dto/create-residence.dto';

@ApiTags('Residence')
@Controller('residence')
export class ResidenceController {
  constructor(private readonly residenceService: ResidenceService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Residence with general info',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(createResidenceSchema, 'body'))
  async create(@Body() createResidenceDto: CreateResidenceDto) {
    const residence = await this.residenceService.create(createResidenceDto);
    return ResponseService.buildResponse({ residence }, 'Residence created successfully');
  }
}