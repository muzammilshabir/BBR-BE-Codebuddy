import { Controller, Post, Patch, Get, Body, Param, Query, Delete, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { BespokeRequestService } from './bespokeRequests.service';
import {
  CreateBespokeRequestDto,
  createBespokeRequestSchema,
} from './dto/create-bespoke-request.dto';
import { UpdateBespokeRequestDto, updateBespokeRequestSchema } from './dto/update-bespoke-info.dto';
import { ListBespokeRequestDto, listBespokeRequestSchema } from './dto/list-bespoke-request.dto';
import {
  UpdateBespokeRequestFeatureDto,
  updateBespokeRequestFeatureSchema,
} from './dto/update-bespoke-request-feature.dto';
import { UserRole } from 'src/users/enum/user.enum';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';

@ApiTags('Bespoke Requests')
@Controller('bespoke-requests')
export class BespokeRequestController {
  constructor(private readonly bespokeRequestService: BespokeRequestService) {}

  @Get()
  @ApiOperation({ summary: 'List bespoke requests' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listBespokeRequestSchema, 'query'))
  async list(@Query() listBespokeRequestDto: ListBespokeRequestDto) {
    const result = await this.bespokeRequestService.list(listBespokeRequestDto);
    return ResponseService.buildResponse(result, 'Bespoke requests retrieved successfully');
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Create a bespoke request' })
  @UsePipes(new JoiValidationPipe(createBespokeRequestSchema, 'body'))
  async create(
    @Body() createBespokeRequestDto: CreateBespokeRequestDto,
    @GetCurrentUserId() userId: string
  ) {
    const bespokeRequest = await this.bespokeRequestService.create(createBespokeRequestDto, userId);
    return ResponseService.buildResponse(bespokeRequest, 'Bespoke request created successfully');
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a bespoke request' })
  @UsePipes(new JoiValidationPipe(updateBespokeRequestSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateBespokeRequestDto: UpdateBespokeRequestDto,
    @GetCurrentUserId() userId: string
  ) {
    const updatedRequest = await this.bespokeRequestService.update(
      id,
      updateBespokeRequestDto,
      userId
    );
    return ResponseService.buildResponse(updatedRequest, 'Bespoke request updated successfully');
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get bespoke request details' })
  async findById(@Param('id') id: string) {
    const bespokeRequest = await this.bespokeRequestService.findById(id);
    return ResponseService.buildResponse(
      bespokeRequest,
      'Bespoke request details retrieved successfully'
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a bespoke request' })
  async delete(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    const result = await this.bespokeRequestService.delete(id, userId);
    return ResponseService.buildResponse(result, 'Bespoke request deleted successfully');
  }

  @Post(':id/invoice')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a manual invoice for a bespoke request' })
  @UsePipes(new JoiValidationPipe(updateBespokeRequestFeatureSchema, 'body'))
  async createInvoice(
    @Param('id') id: string,
    @Body() updateBespokeRequestFeatureDto: UpdateBespokeRequestFeatureDto
  ) {
    const result = await this.bespokeRequestService.createManualInvoice(
      id,
      updateBespokeRequestFeatureDto
    );
    return ResponseService.buildResponse(result, 'Manual invoice created successfully');
  }

  @Get('invoice/:invoiceId/finalize')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Finalize a manual invoice for a bespoke request' })
  async finalizeInvoice(@Param('invoiceId') invoiceId: string) {
    const result = await this.bespokeRequestService.finalizeInvoice(invoiceId);
    return ResponseService.buildResponse(result, 'Invoice Finalized successfully');
  }
}
