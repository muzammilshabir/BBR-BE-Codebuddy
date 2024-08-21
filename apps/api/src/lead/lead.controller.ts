import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto, createLeadSchema } from './dto/lead.dto';

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
}
