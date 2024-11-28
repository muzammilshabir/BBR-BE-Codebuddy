import { Controller, Post, Patch, Get, Body, Param, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { FeatureRequestService } from './featureRequests.service';
import { CreateFeatureRequestDto, createFeatureRequestSchema } from './dto/create-feature-request.dto';
import { UpdateFeatureRequestDto, updateFeatureRequestSchema } from './dto/update-feature-request.dto';
import { UserRole } from 'src/users/enum/user.enum';

@ApiTags('Feature Requests')
@Controller('feature-request')
export class FeatureRequestController {
  constructor(private readonly featureRequestService: FeatureRequestService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Create a new feature request' })
  @UsePipes(new JoiValidationPipe(createFeatureRequestSchema, 'body'))
  async create(
    @Body() createFeatureRequestDto: CreateFeatureRequestDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.featureRequestService.create(createFeatureRequestDto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a feature request' })
  @UsePipes(new JoiValidationPipe(updateFeatureRequestSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateFeatureRequestDto: UpdateFeatureRequestDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.featureRequestService.update(id, updateFeatureRequestDto, userId);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured residences' })
  async getFeaturedResidences() {
    return this.featureRequestService.getFeaturedResidences();
  }
} 