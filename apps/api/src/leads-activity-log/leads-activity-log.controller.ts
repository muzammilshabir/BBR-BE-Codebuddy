import { Controller, Get, Query, Res, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { Response } from 'express';
import {
  ListLeadsActivityLogDto,
  listLeadsActivityLogSchema,
} from './dto/list-leads-activity-log.dto';
import { LeadsActivityLogService } from './leads-activity-log.service';

@ApiTags('Leads Activity Log')
@Controller('leads-activity-log')
@ApiBearerAuth()
export class LeadsActivityLogController {
  constructor(private readonly leadsActivityLogService: LeadsActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listLeadsActivityLogSchema, 'query'))
  async findAll(@Query() query: ListLeadsActivityLogDto, @Res() res: Response) {
    const result = await this.leadsActivityLogService.list(query);
    if (query.isDownload) {
      if (query.fileType === 'csv') {
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=activity-logs.csv');
        return res.send(result);
      } else if (query.fileType === 'excel') {
        res.header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.header('Content-Disposition', 'attachment; filename=activity-logs.xlsx');
        return res.send(result);
      }
    }
    return res.json(ResponseService.buildResponse(result, 'Activity logs retrieved successfully'));
  }
}
