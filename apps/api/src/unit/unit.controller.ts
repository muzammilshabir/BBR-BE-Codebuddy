import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Param, Post, Put, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import { AddUnitDto, addUnitSchema } from './dto/add-unit.dto';
import { AddUnitKeyFeaturesDto, addUnitKeyFeaturesSchema } from './dto/unit-key-features.dto';

@ApiTags('Unit')
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post(':residenceId')
  @ApiOperation({
    summary: 'Add a Unit to a Residence',
  })
  @UsePipes(new JoiValidationPipe(addUnitSchema, 'body'))
  async addUnit(@Param('residenceId') residenceId: string, @Body() addUnitDto: AddUnitDto) {
    const unit = await this.unitService.addUnit(addUnitDto, residenceId);
    return ResponseService.buildResponse({ unit }, 'Unit added successfully');
  }

  @Post(':unitId/key-features')
  @ApiOperation({
    summary: 'Add key features in Unit',
  })
  @UsePipes(new JoiValidationPipe(addUnitKeyFeaturesSchema, 'body'))
  async addUnitKeyFeatures(
    @Param('unitId') unitId: string,
    @Body() unitKeyFeaturesDto: AddUnitKeyFeaturesDto
  ) {
    const unitKeyFeatures = await this.unitService.addUnitKeyFeatures(unitKeyFeaturesDto, unitId);
    return {
      message: 'Unit key features added successfully',
      data: unitKeyFeatures,
    };
  }
}
