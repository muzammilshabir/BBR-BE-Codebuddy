import {
  Controller,
  Get,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { Response } from 'express';
import { DevResidenceActivityLogService } from './dev-residence-activity-log.service';
import { ListDevResidenceActivityLogDto, listDevResidenceActivityLogSchema } from './dto/dev-list-residence-activity-log.dto';

@ApiTags('DevResidence Activity Log')
@Controller('residence-activity-log')
@ApiBearerAuth()
export class DevResidenceActivityLogController {
  constructor(private readonly residenceActivityLogService: DevResidenceActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listDevResidenceActivityLogSchema, 'query'))
  async findAll(@Query() query: ListDevResidenceActivityLogDto, @Res() res: Response) {
    const result = await this.residenceActivityLogService.list(query);
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
