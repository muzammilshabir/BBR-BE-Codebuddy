import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto, createLeadSchema } from './dto/create-lead.dto';
import { ListLeadDto, listListSchema } from './dto/list-lead.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { UpdateLeadDto, updateLeadSchema } from './dto/update-lead.dto';

@ApiTags('Lead')
@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @ApiOperation({ summary: 'Create Lead' })
  @Public()
  @UsePipes(new JoiValidationPipe(createLeadSchema, 'body'))
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadService.create(createLeadDto);
    return ResponseService.buildResponse({ lead }, 'lead created successfully');
  }

  @Get('/')
  @ApiOperation({ summary: 'List lead filters' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listListSchema, 'query'))
  async listLeads(@Query() query: ListLeadDto, @GetCurrentUser() user: JwtPayloadType) {
    const leads = await this.leadService.getLeadsWithRole(query, user);
    return ResponseService.buildResponse({ leads }, 'Leads retrieved successfully');
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update Lead' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateLeadSchema, 'body'))
  async updateLead(
    @GetCurrentUser() user: JwtPayloadType,
    @Param('id') leadId: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    const lead = await this.leadService.updateLeadWithRole(leadId, updateLeadDto, user);
    return ResponseService.buildResponse({ lead }, 'lead updated successfully');
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Lead by ID' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async getLeadById(
    @GetCurrentUser() user: JwtPayloadType,
    @Param('id') leadId: string,
  ) {
    const lead = await this.leadService.getLeadWithRole(leadId, user);
    return ResponseService.buildResponse({ lead }, 'lead retrieved successfully');
  }

  @Get('admin/statistics')
  @ApiOperation({ summary: 'Get lead statistics' })
  @Roles(UserRole.ADMIN)
  async getLeadStatisticsAdmin() {
    const statistics = await this.leadService.getLeadStatisticsAdmin();
    console.log(statistics);
    return ResponseService.buildResponse(statistics, 'Lead statistics retrieved successfully');
  }

  @Get('admin/counts-by-source')
  @ApiOperation({ summary: 'Get lead counts by source' })
  @Roles(UserRole.ADMIN)
  async getLeadCountsBySourceAdmin() {
    const counts = await this.leadService.getLeadCountsBySourceAdmin();
    return ResponseService.buildResponse(counts, 'Lead counts by source retrieved successfully');
  }

  @Get('admin/counts-by-week')
  @ApiOperation({ summary: 'Get lead counts by week for last 4 weeks' })
  @Roles(UserRole.ADMIN)
  async getLeadCountsByWeekAdmin() {
    const counts = await this.leadService.getLeadCountsByWeekAdmin();
    return ResponseService.buildResponse(counts, 'Lead counts by week retrieved successfully');
  }

  @Get('seller/statistics')
  @ApiOperation({ summary: 'Get lead statistics' })
  @Roles(UserRole.SELLER)
  async getLeadStatistics(@GetCurrentUser() user: JwtPayloadType) {
    const statistics = await this.leadService.getLeadStatistics(user.sub);
    return ResponseService.buildResponse(statistics, 'Lead statistics retrieved successfully');
  }

  @Get('seller/counts')
  @ApiOperation({ summary: 'Get lead counts by source, status, or country' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: true })
  @ApiQuery({ name: 'countBy', enum: ['source', 'status', 'country'], required: true })
  @Roles(UserRole.SELLER)
  async getLeadCounts(
    @Query('period') period: 'week' | 'month' | 'year',
    @Query('countBy') countBy: 'source' | 'status' | 'country',
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const counts = await this.leadService.getLeadCounts(user.sub, period, countBy);
    return ResponseService.buildResponse(counts, `Lead counts by ${countBy} retrieved successfully`);
  }
  

  @Get('seller/conversion-by-time')
  @ApiOperation({ summary: 'Get lead conversion by time period' })
  @ApiQuery({ name: 'period', enum: ['weeks', 'months', 'years'], required: true })
  @Roles(UserRole.SELLER)
  async getLeadConversionByTime(
    @Query('period') period: 'weeks' | 'months' | 'years',
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const counts = await this.leadService.getLeadConversionByTime(user.sub, period);
    return ResponseService.buildResponse(counts, 'Lead conversion by time period retrieved successfully');
  }
}
