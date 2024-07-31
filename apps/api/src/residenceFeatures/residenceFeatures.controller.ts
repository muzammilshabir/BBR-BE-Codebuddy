import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceFeatureService } from './residenceFeatures.service';
import {
  ListResidenceFeaturesDto,
  listResidenceFeaturesSchema,
} from './dto/listResidenceFeatures.dto';

@ApiTags('ResidenceFeature')
@Controller('residenceFeature')
export class ResidenceFeatureController {
  constructor(private readonly residenceFeatureService: ResidenceFeatureService) {}

  @Get()
  @ApiOperation({
    summary: 'List all residenceFeature',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listResidenceFeaturesSchema, 'query'))
  async list(@Query() listResidenceFeaturesDto: ListResidenceFeaturesDto) {
    const data = await this.residenceFeatureService.findAll(listResidenceFeaturesDto);
    return ResponseService.buildResponse(data);
  }
}
