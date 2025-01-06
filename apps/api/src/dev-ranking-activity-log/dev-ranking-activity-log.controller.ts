import { Controller, Get, Query, Res, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { Response } from 'express';
import {
  ListDevRankingActivityLogDto,
  listDevRankingActivityLogSchema,
} from './dto/list-dev-ranking-activity-log.dto';
import { DevRankingActivityLogService } from './dev-ranking-activity-log.service';

@ApiTags('DevRanking Activity Log')
@Controller('dev-ranking-activity-log')
@ApiBearerAuth()
export class DevRankingActivityLogController {
  constructor(private readonly devRankingActivityLogService: DevRankingActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listDevRankingActivityLogSchema, 'query'))
  async findAll(@Query() query: ListDevRankingActivityLogDto, @Res() res: Response) {
    const result = await this.devRankingActivityLogService.list(query);
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
