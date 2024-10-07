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
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import { AddUnitDto, addUnitSchema, FileUploadDto } from './dto/add-unit.dto';
import { AddUnitKeyFeaturesDto, addUnitKeyFeaturesSchema } from './dto/unit-key-features.dto';
import { AddVisualsDto, addVisualsSchema } from './dto/add-visuals.dto';
import { GetUnitByIdDto, getUnitByIdSchema } from './dto/get-unit-by-id.dto';
import { ListUnitDto, listUnitSchema } from './dto/list-unit.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { UpdateUnitDto, updateUnitSchema } from './dto/update-unit.dto';

@ApiTags('Unit')
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post(':residenceId')
  @ApiOperation({
    summary: 'Add a Unit to a Residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(addUnitSchema, 'body'))
  async addUnit(
    @Param('residenceId') residenceId: string,
    @Body() addUnitDto: AddUnitDto,
    @GetCurrentUserId() userId: string
  ) {
    const unit = await this.unitService.addUnit(addUnitDto, residenceId, userId);
    return ResponseService.buildResponse({ unitDraft: unit }, 'Unit added successfully');
  }

  @Put(':unitId/key-features')
  @ApiOperation({
    summary: 'Add key features in Unit',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(addUnitKeyFeaturesSchema, 'body'))
  async addUnitKeyFeatures(
    @Param('unitId') unitId: string,
    @Body() unitKeyFeaturesDto: AddUnitKeyFeaturesDto,
    @GetCurrentUserId() userId: string
  ) {
    const unitKeyFeatures = await this.unitService.addUnitKeyFeatures(
      unitKeyFeaturesDto,
      unitId,
      userId
    );
    return {
      message: 'Unit key features added successfully',
      data: unitKeyFeatures,
    };
  }

  @Put(':unitId/visuals')
  @ApiOperation({
    summary: 'Update visuals of a Unit',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(addVisualsSchema, 'body'))
  async addVisuals(
    @Param('unitId') unitId: string,
    @Body() addVisualsDto: AddVisualsDto,
    @GetCurrentUserId() userId: string
  ) {
    const updatedUnit = await this.unitService.addVisuals(addVisualsDto, unitId, userId);
    return {
      message: 'Unit visuals updated successfully',
      data: updatedUnit,
    };
  }

  @Put(':unitId/update')
  @ApiOperation({
    summary: 'Update an existing Unit',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateUnitSchema, 'body'))
  async updateUnit(
    @Param('unitId') unitId: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @GetCurrentUserId() userId: string
  ) {
    const updatedUnit = await this.unitService.updateUnit(unitId, updateUnitDto, userId);
    return ResponseService.buildResponse({ unitDraft: updatedUnit }, 'Unit updated successfully');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Units with optional residenceId filter',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listUnitSchema, 'query'))
  async listUnits(@Query() query: ListUnitDto) {
    const units = await this.unitService.listUnits(query);
    return ResponseService.buildResponse(units, 'Units retrieved successfully');
  }

  @Get('/with-draft')
  @ApiOperation({
    summary: 'List Units with draft optional residenceId filter',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listUnitSchema, 'query'))
  async listUnitsWithDraft(@Query() query: ListUnitDto) {
    const units = await this.unitService.listUnitsWithDraft(query);
    return ResponseService.buildResponse(units, 'Units retrieved successfully');
  }

  @Get(':unitId')
  @ApiOperation({
    summary: 'Get Unit by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getUnitByIdSchema, 'param'))
  async getUnitById(@Param() params: GetUnitByIdDto) {
    const unit = await this.unitService.getUnitById(params.unitId);
    return ResponseService.buildResponse({ unit }, 'Unit retrieved successfully');
  }

  @Delete(':unitId')
  @ApiOperation({
    summary: 'Delete Unit by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getUnitByIdSchema, 'param'))
  async deleteUnit(@Param() params: GetUnitByIdDto) {
    const unit = await this.unitService.deleteUnit(params.unitId);
    return ResponseService.buildResponse({ unit }, 'Unit Deleted successfully');
  }

  @Post(':residenceId/bulk-add/:fileId')
  @ApiOperation({ summary: 'Upload file for bulk add units' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async uploadUnitFile(@Param() params: FileUploadDto, @GetCurrentUserId() userId: string) {
    try {
      const { residenceId, fileId } = params;
      const units = await this.unitService.processUploadedFile(residenceId, fileId, userId);
      return ResponseService.buildResponse({ units }, 'File uploaded and processed successfully');
    } catch (error) {
      throw new BadRequestException('Error processing file: ' + error.message);
    }
  }
}
