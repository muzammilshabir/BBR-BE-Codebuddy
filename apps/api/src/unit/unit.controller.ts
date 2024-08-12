import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import {
  AddUnitDto,
  addUnitSchema,
  FileUploadDto,
  ResidenceIdDto,
  residenceIdSchema,
} from './dto/add-unit.dto';
import { AddUnitKeyFeaturesDto, addUnitKeyFeaturesSchema } from './dto/unit-key-features.dto';
import { AddVisualsDto, addVisualsSchema } from './dto/add-visuals.dto';
import { GetUnitByIdDto, getUnitByIdSchema } from './dto/get-unit-by-id.dto';
import { ListUnitDto, listUnitSchema } from './dto/list-unit.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
    const userId = '64b1b5f4e05c12a1f5d8e7c2'; // we will take this id from authentication
    const unit = await this.unitService.addUnit(addUnitDto, residenceId, userId);
    return ResponseService.buildResponse({ unit }, 'Unit added successfully');
  }

  @Put(':unitId/key-features')
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

  @Put(':unitId/visuals')
  @ApiOperation({
    summary: 'Update visuals of a Unit',
  })
  @UsePipes(new JoiValidationPipe(addVisualsSchema, 'body'))
  async addVisuals(@Param('unitId') unitId: string, @Body() addVisualsDto: AddVisualsDto) {
    const updatedUnit = await this.unitService.addVisuals(addVisualsDto, unitId);
    return {
      message: 'Unit visuals updated successfully',
      data: updatedUnit,
    };
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Units with optional residenceId filter',
  })
  @UsePipes(new JoiValidationPipe(listUnitSchema, 'query'))
  async listUnits(@Query() query: ListUnitDto) {
    const units = await this.unitService.listUnits(query);
    return ResponseService.buildResponse({ units }, 'Units retrieved successfully');
  }

  @Get(':unitId')
  @ApiOperation({
    summary: 'Get Unit by ID',
  })
  @UsePipes(new JoiValidationPipe(getUnitByIdSchema, 'param'))
  async getUnitById(@Param() params: GetUnitByIdDto) {
    const unit = await this.unitService.getUnitById(params.unitId);
    return ResponseService.buildResponse({ unit }, 'Unit retrieved successfully');
  }

  @Delete(':unitId')
  @ApiOperation({
    summary: 'Delete Unit by ID',
  })
  @UsePipes(new JoiValidationPipe(getUnitByIdSchema, 'param'))
  async deleteUnit(@Param() params: GetUnitByIdDto) {
    const unit = await this.unitService.deleteUnit(params.unitId);
    return ResponseService.buildResponse({ unit }, 'Unit Deleted successfully');
  }

  @Post(':residenceId/bulk-add')
  @ApiOperation({ summary: 'Upload file for bulk add units' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file for units in the residence',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new JoiValidationPipe(residenceIdSchema, 'param'))
  async uploadUnitFile(@Param() params: ResidenceIdDto, @UploadedFile() file: Express.Multer.File) {
    try {
      const userId = '64b1b5f4e05c12a1f5d8e7c2'; // we will take this id from authentication
      const result = await this.unitService.processUploadedFile(file, params.residenceId, userId);
      return ResponseService.buildResponse({ result }, 'File uploaded and processed successfully');
    } catch (error) {
      throw new BadRequestException('Error processing file: ' + error.message);
    }
  }
}
