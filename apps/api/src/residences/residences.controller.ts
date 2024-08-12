import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Post, Put, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceService } from './residences.service';
import { CreateResidenceDto, createResidenceSchema } from './dto/create-residence.dto';
import { UpdateResidenceDto, updateResidenceSchema } from './dto/update-residence.dto';
import { AddKeyFeaturesDto, addKeyFeaturesSchema } from './dto/residenceKeyFeatures.dto';
import { AddVisualsDto, addVisualsSchema } from './dto/add-visuals.dto';
import {
  UpdateNearbyAmenitiesDto,
  updateNearbyAmenitiesSchema,
} from './dto/update-nearby-amenities.dto';
import { GetResidenceByIdDto, getResidenceByIdSchema } from './dto/get-residence-by-id.dto';

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

  @Put(':id')
  @ApiOperation({
    summary: 'Update Residence general info',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(updateResidenceSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateResidenceDto: UpdateResidenceDto) {
    const residence = await this.residenceService.updateGeneralInfo(id, updateResidenceDto);
    return ResponseService.buildResponse({ residence }, 'Residence updated successfully');
  }

  @Put(':id/key-features')
  @ApiOperation({
    summary: 'Add Residence Key Features',
  })
  @UsePipes(new JoiValidationPipe(addKeyFeaturesSchema, 'body'))
  async addKeyFeatures(@Param('id') id: string, @Body() addKeyFeaturesDto: AddKeyFeaturesDto) {
    const residence = await this.residenceService.addKeyFeatures(id, addKeyFeaturesDto);
    return ResponseService.buildResponse(
      { residence },
      'Residence key features added successfully'
    );
  }

  @Put(':id/visuals')
  @ApiOperation({
    summary: 'Add or update visuals for a residence',
  })
  @UsePipes(new JoiValidationPipe(addVisualsSchema, 'body'))
  async addVisuals(@Param('id') id: string, @Body() addVisualsDto: AddVisualsDto) {
    const residence = await this.residenceService.addVisuals(id, addVisualsDto);
    return {
      message: 'Residence visuals updated successfully',
      residence,
    };
  }

  @Put(':id/nearby-amenities')
  @ApiOperation({
    summary: 'Add or update nearby amenities for a residence',
  })
  @UsePipes(new JoiValidationPipe(updateNearbyAmenitiesSchema, 'body'))
  async updateNearbyAmenities(
    @Param('id') id: string,
    @Body() updateNearbyAmenitiesDto: UpdateNearbyAmenitiesDto
  ) {
    const residence = await this.residenceService.updateNearbyAmenities(
      id,
      updateNearbyAmenitiesDto
    );
    return ResponseService.buildResponse(
      { residence },
      'Residence nearby amenities updated successfully'
    );
  }

  @Get(':residenceId')
  @ApiOperation({
    summary: 'Get Residence by ID',
  })
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  async getResidenceById(@Param() params: GetResidenceByIdDto) {
    const unit = await this.residenceService.getResidenceById(params.residenceId);
    return ResponseService.buildResponse({ unit }, 'Residence retrieved successfully');
  }
}
