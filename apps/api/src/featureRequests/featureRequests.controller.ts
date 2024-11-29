import { Controller, Post, Patch, Get, Body, Param, UsePipes, Query, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { FeatureRequestService } from './featureRequests.service';
import {
  CreateFeatureRequestDto,
  createFeatureRequestSchema,
} from './dto/create-feature-request.dto';
import {
  UpdateFeatureRequestDto,
  updateFeatureRequestSchema,
} from './dto/update-feature-request.dto';
import { ListFeatureRequestDto, listFeatureRequestSchema } from './dto/list-feature-request.dto';
import { UserRole } from 'src/users/enum/user.enum';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { UpdatePaymentInfoDto, updatePaymentInfoSchema } from './dto/update-payment-info.dto';

@ApiTags('Feature Requests')
@Controller('feature-request')
export class FeatureRequestController {
  constructor(private readonly featureRequestService: FeatureRequestService) {}

  @Get()
  @ApiOperation({ summary: 'List feature requests' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listFeatureRequestSchema, 'query'))
  async list(@Query() listFeatureRequestDto: ListFeatureRequestDto) {
    const featureRequests = await this.featureRequestService.list(listFeatureRequestDto);
    return ResponseService.buildResponse(
      featureRequests,
      'All feature requests retrieved successfully'
    );
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new feature request' })
  @UsePipes(new JoiValidationPipe(createFeatureRequestSchema, 'body'))
  async create(
    @Body() createFeatureRequestDto: CreateFeatureRequestDto,
    @GetCurrentUserId() userId: string
  ) {
    const featureRequest = await this.featureRequestService.create(createFeatureRequestDto, userId);
    return ResponseService.buildResponse(featureRequest, 'Feature request created successfully');
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a feature request' })
  @UsePipes(new JoiValidationPipe(updateFeatureRequestSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateFeatureRequestDto: UpdateFeatureRequestDto,
    @GetCurrentUserId() userId: string
  ) {
    const featureRequest = await this.featureRequestService.update(
      id,
      updateFeatureRequestDto,
      userId
    );
    return ResponseService.buildResponse(featureRequest, 'Feature request updated successfully');
  }

  @Patch(':id/payment')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Update payment information for a feature request' })
  @UsePipes(new JoiValidationPipe(updatePaymentInfoSchema, 'body'))
  async updatePaymentInfo(
    @Param('id') id: string,
    @Body() updatePaymentInfoDto: UpdatePaymentInfoDto,
    @GetCurrentUserId() userId: string
  ) {
    const featureRequest = await this.featureRequestService.updatePaymentInfo(
      id,
      updatePaymentInfoDto,
      userId
    );
    return ResponseService.buildResponse(featureRequest, 'Payment information updated successfully');
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured residences' })
  async getFeaturedResidences() {
    const featureResidences = await this.featureRequestService.getFeaturedResidences();
    return ResponseService.buildResponse(
      featureResidences,
      'Featured residences retrieved successfully'
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Get feature request by ID' })
  async findById(@Param('id') id: string) {
    const featureRequest = await this.featureRequestService.findById(id);
    return ResponseService.buildResponse(
      featureRequest,
      'Feature request retrieved successfully'
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a feature request' })
  async delete(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    const featureRequest = await this.featureRequestService.delete(id, userId);
    return ResponseService.buildResponse(
      featureRequest,
      'Feature request deleted successfully'
    );
  }
}
