import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto, createLeadSchema } from './dto/lead.dto';
import { ListLeadDto, listListSchema, UpdateLeadDto, updateListSchema } from './dto/list-lead.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';

@ApiTags('Lead')
@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Lead',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(createLeadSchema, 'body'))
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadService.create(createLeadDto);
    return ResponseService.buildResponse({ lead }, 'lead created successfully');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List lead with optional residenceId filter',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listListSchema, 'query'))
  async listLeads(@Query() query: ListLeadDto, @GetCurrentUser() user: JwtPayloadType) {
    const leads = await this.leadService.listLeads(query, user.sub);
    return ResponseService.buildResponse({ leads }, 'leads retrieved successfully');
  }

  @Patch('/:id/update-status')
  @ApiOperation({
    summary: 'Update Lead Status',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateListSchema, 'body'))
  async updateLeadStatus(@Param('id') leadId: string, @Body() updateLeadDto: UpdateLeadDto) {
    const lead = await this.leadService.updateLeadStatus(leadId, updateLeadDto.status);
    return ResponseService.buildResponse({ lead }, 'leads updated successfully');
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get Lead by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async getLeadById(@Param('id') leadId: string) {
    const lead = await this.leadService.getLeadById(leadId);
    return ResponseService.buildResponse({ lead }, 'lead retrieved successfully');
  }
}
