import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Post, Put, Query, Res, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceService } from './residences.service';
import { CreateResidenceDto, createResidenceSchema } from './dto/create-residence.dto';
import {
  ResidenceStatusDto,
  UpdateResidenceDto,
  updateResidenceSchema,
  updateResidenceStatusSchema,
} from './dto/update-residence.dto';
import { AddKeyFeaturesDto, addKeyFeaturesSchema } from './dto/residenceKeyFeatures.dto';
import { AddVisualsDto, addVisualsSchema } from './dto/add-visuals.dto';
import {
  UpdateNearbyAmenitiesDto,
  updateNearbyAmenitiesSchema,
} from './dto/update-nearby-amenities.dto';
import { GetResidenceByIdDto, getResidenceByIdSchema } from './dto/get-residence-by-id.dto';
import { ListResidenceDto, listResidenceSchema } from './dto/list-residence.dto';
import { Response } from 'express';

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

  @Put('/:id/update-status')
  @ApiOperation({
    summary: 'Update Residence by ID',
  })
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(updateResidenceStatusSchema, 'body'))
  async updateResidenceStatus(
    @Param() params: GetResidenceByIdDto,
    @Body() body: ResidenceStatusDto
  ) {
    const residence = await this.residenceService.updateResidenceStatus(params.id, body.status);
    return ResponseService.buildResponse({ residence }, 'Residence retrieved successfully');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Residence',
  })
  @UsePipes(new JoiValidationPipe(listResidenceSchema, 'query'))
  async listResidences(@Query() query: ListResidenceDto, @Res() res: Response) {
    const result = await this.residenceService.listResidences(query);

    if (query.isDownload) {
      if (query.fileType === 'csv') {
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=residences.csv');
        return res.send(result);
      } else if (query.fileType === 'excel') {
        res.header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.header('Content-Disposition', 'attachment; filename=residences.xlsx');
        return res.send(result);
      }
    }
    return res.json(
      ResponseService.buildResponse({ residences: result }, 'Residence retrieved successfully')
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Residence by ID',
  })
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  async getResidenceById(@Param() params: GetResidenceByIdDto) {
    const residence = await this.residenceService.getResidenceById(params.id);
    return ResponseService.buildResponse({ residence }, 'Residence retrieved successfully');
  }
}
