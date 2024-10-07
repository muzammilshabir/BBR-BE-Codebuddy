import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceFeatureService } from './residenceFeatures.service';
import {
  ListResidenceFeaturesDto,
  listResidenceFeaturesSchema,
} from './dto/listResidenceFeatures.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  UpdateResidenceFeaturesDto,
  updateResidenceFeaturesSchema,
} from './dto/updateResidenceFeatures.dto';

@ApiTags('ResidenceFeature')
@Controller('residence-feature')
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an ResidenceFeatures by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateResidenceFeaturesSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateResidenceFeaturesDto: UpdateResidenceFeaturesDto
  ) {
    const updatedResidenceFeatures = await this.residenceFeatureService.update(
      id,
      updateResidenceFeaturesDto
    );
    return ResponseService.buildResponse(updatedResidenceFeatures);
  }
}
