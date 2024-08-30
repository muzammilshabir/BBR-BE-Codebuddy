import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { AddResidenceVisualsDto, addResidenceVisualsSchema } from './dto/add-visuals.dto';
import { CreateResidenceDto, createResidenceSchema } from './dto/create-residence.dto';
import { GetResidenceByIdDto, getResidenceByIdSchema } from './dto/get-residence-by-id.dto';
import { ListResidenceDto, listResidenceSchema } from './dto/list-residence.dto';
import { AddKeyFeaturesDto, addKeyFeaturesSchema } from './dto/residenceKeyFeatures.dto';
import {
  UpdateNearbyAmenitiesDto,
  updateNearbyAmenitiesSchema,
} from './dto/update-nearby-amenities.dto';
import {
  RejectResidenceDto,
  rejectResidenceSchema,
  UpdateResidenceDto,
  updateResidenceSchema,
} from './dto/update-residence.dto';
import { ResidenceService } from './residences.service';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';

@ApiTags('Residence')
@Controller('residence')
export class ResidenceController {
  constructor(private readonly residenceService: ResidenceService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Residence with general info',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createResidenceSchema, 'body'))
  async create(@Body() createResidenceDto: CreateResidenceDto) {
    const residence = await this.residenceService.create(createResidenceDto);
    return ResponseService.buildResponse({ residence }, 'Residence created successfully');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Residence general info',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateResidenceSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateResidenceDto: UpdateResidenceDto) {
    const residence = await this.residenceService.updateGeneralInfo(id, updateResidenceDto);
    return ResponseService.buildResponse({ residence }, 'Residence updated successfully');
  }

  @Put(':id/key-features')
  @ApiOperation({
    summary: 'Add Residence Key Features',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
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
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(addResidenceVisualsSchema, 'body'))
  async addVisuals(
    @Param('id') id: string,
    @Body() addVisualsDto: AddResidenceVisualsDto,
    @GetCurrentUserId() userId: string
  ) {
    const residence = await this.residenceService.addVisuals(id, addVisualsDto, userId);
    return {
      message: 'Residence visuals updated successfully',
      residence,
    };
  }

  @Put(':id/nearby-amenities')
  @ApiOperation({
    summary: 'Add or update nearby amenities for a residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
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

  @Patch('/:id/approve-residence')
  @ApiOperation({
    summary: 'Approve Residence by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  async approveResidence(@GetCurrentUserId() userId: string, @Param() params: GetResidenceByIdDto) {
    const residence = await this.residenceService.approveResidence(params.id, userId);
    return ResponseService.buildResponse({ residence }, 'Residence approved successfully');
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

  @Patch('/:id/reject-residence')
  @ApiOperation({
    summary: 'Reject Residence by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(rejectResidenceSchema, 'body'))
  async rejectResidence(
    @GetCurrentUserId() userId: string,
    @Param() params: GetResidenceByIdDto,
    @Body() rejectResidenceDto: RejectResidenceDto
  ) {
    const residence = await this.residenceService.rejectResidence(
      params.id,
      userId,
      rejectResidenceDto
    );
    return ResponseService.buildResponse({ residence }, 'Residence rejected successfully');
  }
}
