import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { AddResidenceVisualsDto, addResidenceVisualsSchema } from './dto/add-visuals.dto';
import { CreateResidenceDto, createResidenceSchema } from './dto/create-residence.dto';
import {
  GetResidenceByIdDto,
  getResidenceByIdSchema,
  GetResidenceByKeyDto,
  getResidenceByKeySchema,
} from './dto/get-residence-by-id.dto';
import {
  ListResidenceByFiltersDto,
  ListResidenceByFiltersQueryPropsDto,
  listResidenceByFiltersSchema,
  ListResidenceDto,
  listResidenceSchema,
  ListResidenceWithDraftCountDto,
  ListResidenceWithDraftDto,
  ListTopResidencesDto,
  listTopResidencesSchema,
} from './dto/list-residence.dto';
import { AddKeyFeaturesDto, addKeyFeaturesSchema } from './dto/residenceKeyFeatures.dto';
import {
  UpdateNearbyAmenitiesDto,
  updateNearbyAmenitiesSchema,
} from './dto/update-nearby-amenities.dto';
import {
  RejectResidenceDto,
  rejectResidenceSchema,
  UpdateFeaturedDto,
  updateFeaturedSchema,
  UpdateResidenceDto,
  updateResidenceSchema,
  UpdateResidenceStatusDto,
  updateResidenceStatusSchema,
} from './dto/update-residence.dto';
import { ResidenceService } from './residences.service';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { Public } from '../auth/decorators/public.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';
import { GetSimilarResidenceDto, getSimilarResidenceSchema } from './dto/get-similar-residence';
import { ResidenceSeederService } from './residencesSeeder.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PassThrough } from 'stream';

@ApiTags('Residence')
@Controller('residence')
export class ResidenceController {
  constructor(private readonly residenceService: ResidenceService, private readonly residenceSeederService: ResidenceSeederService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Residence and Draft with general info',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(createResidenceSchema, 'body'))
  async create(
    @Body() createResidenceDto: CreateResidenceDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const residence = await this.residenceService.create(createResidenceDto, user);
    return ResponseService.buildResponse({ residence }, 'Residence created successfully');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Residence general info',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(updateResidenceSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateResidenceDto: UpdateResidenceDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const residence = await this.residenceService.updateGeneralInfo(id, updateResidenceDto, user);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence updated successfully'
    );
  }

  @Put(':id/key-features')
  @ApiOperation({
    summary: 'Add Residence Key Features',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(addKeyFeaturesSchema, 'body'))
  async addKeyFeatures(
    @Param('id') id: string,
    @Body() addKeyFeaturesDto: AddKeyFeaturesDto,
    @GetCurrentUserId() userId: string
  ) {
    const residence = await this.residenceService.addKeyFeatures(id, addKeyFeaturesDto, userId);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence key features added successfully'
    );
  }

  @Put(':id/visuals')
  @ApiOperation({
    summary: 'Add or update visuals for a residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(addResidenceVisualsSchema, 'body'))
  async addVisuals(
    @Param('id') id: string,
    @Body() addVisualsDto: AddResidenceVisualsDto,
    @GetCurrentUserId() userId: string
  ) {
    const residence = await this.residenceService.addVisuals(id, addVisualsDto, userId);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence visuals updated successfully'
    );
  }

  @Put(':id/nearby-amenities')
  @ApiOperation({
    summary: 'Add or update nearby amenities for a residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(updateNearbyAmenitiesSchema, 'body'))
  async updateNearbyAmenities(
    @Param('id') id: string,
    @Body() updateNearbyAmenitiesDto: UpdateNearbyAmenitiesDto,
    @GetCurrentUserId() userId: string
  ) {
    const residence = await this.residenceService.updateNearbyAmenities(
      id,
      updateNearbyAmenitiesDto,
      userId
    );
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence nearby amenities updated successfully'
    );
  }

  @Patch('/:id/approve-residence')
  @ApiOperation({
    summary: 'Approve Residence by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  async approveResidence(@GetCurrentUserId() userId: string, @Param() params: GetResidenceByIdDto) {
    const residence = await this.residenceService.approveResidence(params.id, userId);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence approved successfully'
    );
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Residence',
  })
  @Public()
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
    return res.json(ResponseService.buildResponse(result, 'Residence retrieved successfully'));
  }

  @Get('/with-draft')
  @ApiOperation({
    summary: 'List Residence',
  })
  @Public()
  async listResidencesWithDraft(@Query() query: ListResidenceWithDraftDto) {
    const result = await this.residenceService.listResidencesWithDraft(query);

    return ResponseService.buildResponse(result, 'Residence retrieved successfully');
  }

  @Get('/with-draft/count')
  @ApiOperation({
    summary: 'Get Residence Total Count',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.BUYER)
  @Permissions('residence', PermissionLevel.READ)
  async getResidencesTotalCount(@Query() query: ListResidenceWithDraftCountDto) {
    const result = await this.residenceService.getResidencesTotalCount(query);

    return ResponseService.buildResponse(result, 'Residence total count retrieved successfully');
  }

  @Get('/similar-residence')
  @ApiOperation({
    summary: 'List Similar Residence',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getSimilarResidenceSchema, 'query'))
  async getSimilarResidences(@Query() query: GetSimilarResidenceDto) {
    const result = await this.residenceService.getSimilarResidences(query);

    return ResponseService.buildResponse(result, 'Similar Residence retrieved successfully');
  }

  @Get('/top-residences')
  @ApiOperation({
    summary: 'List Top Residence',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listTopResidencesSchema, 'query'))
  async getTopResidences(@Query() query: ListTopResidencesDto) {
    const result = await this.residenceService.getTopResidences(query);

    return ResponseService.buildResponse(result, 'Top Residence retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Residence by ID',
  })
  @Public()
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
  @Permissions('residence', PermissionLevel.EDIT)
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

  @Post('/list-by-filters')
  @ApiOperation({
    summary: 'List Residence',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listResidenceByFiltersSchema, 'body'))
  async residencesListByFilters(
    @Query() listPropsDto: ListResidenceByFiltersQueryPropsDto,
    @Body() listResidenceByFiltersDto: ListResidenceByFiltersDto
  ) {
    const result = await this.residenceService.listResidencesByFilters(
      listPropsDto,
      listResidenceByFiltersDto
    );

    return ResponseService.buildResponse(
      { residences: result },
      'Residence retrieved successfully'
    );
  }

  @Patch('/:id/update-status')
  @ApiOperation({
    summary: 'Update Residence Status',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(updateResidenceStatusSchema, 'body'))
  async updateResidenceStatus(
    @GetCurrentUserId() userId: string,
    @Param() params: GetResidenceByIdDto,
    @Body() updateResidenceStatusDto: UpdateResidenceStatusDto
  ) {
    const updatedResidence = await this.residenceService.updateResidenceStatus(
      params.id,
      userId,
      updateResidenceStatusDto
    );
    return ResponseService.buildResponse(
      { updatedResidence },
      'Residence status updated successfully'
    );
  }

  @Patch('/:id/unarchive')
  @ApiOperation({
    summary: 'Update Residence Status unarchive',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(getResidenceByIdSchema, 'param'))
  async unarchiveResidence(
    @GetCurrentUserId() userId: string,
    @Param() params: GetResidenceByIdDto
  ) {
    const updatedResidence = await this.residenceService.unarchiveResidence(params.id, userId);
    return ResponseService.buildResponse(
      { updatedResidence },
      'Residence status unarchived successfully'
    );
  }

  @Patch('/update-featured')
  @ApiOperation({
    summary: 'Update Residence Featured Status',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('residence', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(updateFeaturedSchema, 'body'))
  async updateFeaturedStatus(@Body() updateFeaturedDto: UpdateFeaturedDto) {
    const result = await this.residenceService.updateFeaturedStatus(updateFeaturedDto);
    return ResponseService.buildResponse(
      { result },
      'Residence featured status updated successfully'
    );
  }

  @Public()
  @ApiOperation({
    summary: 'Upload bulk data for processing',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload-bulk-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInventoryFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
  
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.residenceSeederService.processUploadedFile(file);
    return ResponseService.buildResponse(result);
  }

  @Get('/welcome-flow/:key')
  @ApiOperation({
    summary: 'Get Residence by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getResidenceByKeySchema, 'param'))
  async getResidenceByKey(@Param() params: GetResidenceByKeyDto) {
    const residence = await this.residenceService.getResidenceByKey(params.key);
    return ResponseService.buildResponse({ residence }, 'Residence retrieved successfully');
  }

  @Put('/welcome-flow/:key')
  @ApiOperation({
    summary: 'Update Residence general info',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(updateResidenceSchema, 'body'))
  async updateWithKey(@Param('key') key: string, @Body() updateResidenceDto: UpdateResidenceDto) {
    const residence = await this.residenceService.updateGeneralInfoByKey(key, updateResidenceDto);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence updated successfully'
    );
  }

  @Put('/welcome-flow/:key/key-features')
  @ApiOperation({
    summary: 'Add Residence Key Features By key',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(addKeyFeaturesSchema, 'body'))
  async addKeyFeaturesByKey(
    @Param('key') key: string,
    @Body() addKeyFeaturesDto: AddKeyFeaturesDto
  ) {
    const residence = await this.residenceService.addKeyFeaturesByKey(key, addKeyFeaturesDto);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence key features added successfully'
    );
  }

  @Put('/welcome-flow/:key/visuals')
  @ApiOperation({
    summary: 'Add or update visuals for a residence By Key',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(addResidenceVisualsSchema, 'body'))
  async addVisualsByKey(@Param('key') key: string, @Body() addVisualsDto: AddResidenceVisualsDto) {
    const residence = await this.residenceService.addVisualsByKey(key, addVisualsDto);
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence visuals updated successfully'
    );
  }

  @Put('/welcome-flow/:key/nearby-amenities')
  @ApiOperation({
    summary: 'Add or update nearby amenities for a residence By Key',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(updateNearbyAmenitiesSchema, 'body'))
  async updateNearbyAmenitiesByKey(
    @Param('key') key: string,
    @Body() updateNearbyAmenitiesDto: UpdateNearbyAmenitiesDto
  ) {
    const residence = await this.residenceService.updateNearbyAmenitiesByKey(
      key,
      updateNearbyAmenitiesDto
    );
    return ResponseService.buildResponse(
      { residenceDraft: residence },
      'Residence nearby amenities updated successfully'
    );
  }

  @Get('download/uniqueurl-csv')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download unique URL residences as CSV',
  })
  async downloadUniqueUrlCsv(@Res() res: Response) {
    const filename = `unique-url-residences-${new Date().toISOString()}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'text/csv');

    const stream = new PassThrough();
    stream.pipe(res);

    await this.residenceService.streamCsvData(stream);
  }
}
