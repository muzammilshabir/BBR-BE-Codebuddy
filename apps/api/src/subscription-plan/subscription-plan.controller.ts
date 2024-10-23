import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreatePlanDto, createPlanDtoSchema } from './dto/create-plan.dto';
import { Public } from '@bbr/api-core/modules/decorators';
import { UpdatePlanDto, updatePlanDtoSchema } from './dto/update-plan.dto';
import { UpdateFeatureDto, updateFeatureDtoSchema } from './dto/update-feature.dto';
import { CreateFeatureDto, createFeatureDtoSchema } from './dto/create-feature.dto';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

@ApiTags('SubscriptionPlans')
@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(
    private readonly planService: SubscriptionPlanService,
  ) {}

  @Post('/plan')
  @ApiOperation({
    summary: 'Create a new plan',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createPlanDtoSchema, 'body'))
  async createPlan(
    @Body() createPlan: CreatePlanDto,
    ) {
    const plan = await this.planService.createPlan(createPlan);
    return ResponseService.buildResponse({ plan }, 'Plan created successfully');
  }

  @Patch('/plan/:id')
  @ApiOperation({
    summary: 'Update Plan',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updatePlanDtoSchema, 'body'))
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlan: UpdatePlanDto,
  ) {
    const plan = await this.planService.updatePlan(id, updatePlan);
    return ResponseService.buildResponse({ plan }, 'Plan Updated successfully');
  }

  @Get('/plan/:id')
  @ApiOperation({
    summary: 'Get Plan',
  })
  @Public()
  async getPlan(
    @Param('id') id: string,
  ) {
    const plan = await this.planService.getPlan(id);
    return ResponseService.buildResponse({ plan }, 'Plan retrieved successfully');
  }

  @Get('/plan/:id/residences')
  @ApiOperation({
    summary: 'Get Plan Residences',
  })
  @ApiOkResponse({
    description: 'The residences associated with the provided plan id',
    example: {
      message: "",
      data: {
        pagination: {},
        residences: [],
      },
    }
})
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(PaginationSchema, 'query'))
  async getPlanResidences(
    @Param('id') id: string,
    @Query() query: ListPropsDto,
  ) {
    const data = await this.planService.getPlanResidences(id, query);
    return ResponseService.buildResponse({ data }, 'Plan Residences retrieved successfully');
  }

  @Get('/plans/')
  @ApiOperation({
    summary: 'Get Plans',
  })
  @Public()
  async getPlans(
  ) {
    const plans = await this.planService.getPlans();
    return ResponseService.buildResponse({ plans }, 'Plans retrieved successfully');
  }

  @Post('/feature')
  @ApiOperation({
    summary: 'Create a new feature',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createFeatureDtoSchema, 'body'))
  async createFeature(
    @Body() createFeature: CreateFeatureDto,
    ) {
    const feature = await this.planService.createFeature(createFeature);
    return ResponseService.buildResponse({ feature }, 'Feature created successfully');
  }

  @Patch('/feature/:id')
  @ApiOperation({
    summary: 'Update Feature',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateFeatureDtoSchema, 'body'))
  async updateFeature(
    @Param('id') id: string,
    @Body() updateFeature: UpdateFeatureDto,
  ) {
    const feature = await this.planService.updatePlan(id, updateFeature);
    return ResponseService.buildResponse({ feature }, 'Feature Updated successfully');
  }

  @Get('/features/')
  @ApiOperation({
    summary: 'Get Features',
  })
  @Public()
  async getFeatures(
  ) {
    const features = await this.planService.getFeatures();
    return ResponseService.buildResponse({ features }, 'Features retrieved successfully');
  }

  @Get('/feature/:id')
  @ApiOperation({
    summary: 'Get Feature',
  })
  @Public()
  async getFeature(
    @Param('id') id: string,
  ) {
    const feature = await this.planService.getFeature(id);
    return ResponseService.buildResponse({ feature }, 'Feature retrieved successfully');
  }
}
