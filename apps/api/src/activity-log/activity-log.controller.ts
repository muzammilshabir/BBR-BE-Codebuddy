import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto, createActivityLogSchema } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto, updateActivityLogSchema } from './dto/update-activity-log.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { ListActivityLogDto } from './dto/list-activity-log.dto';
import { listActivityLogSchema } from './dto/list-activity-log.dto';
import { Response } from 'express';

@ApiTags('Activity Log')
@Controller('activity-log')
@ApiBearerAuth()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @ApiOperation({ summary: 'Create activity log' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createActivityLogSchema, 'body'))
  async create(
    @Body() createActivityLogDto: CreateActivityLogDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const activityLog = await this.activityLogService.create(createActivityLogDto, user.sub);
    return ResponseService.buildResponse({ activityLog }, 'Activity log created successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity log' })
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateActivityLogSchema, 'body'))
  async update(
    @Param('id') id: string,
    @Body() updateActivityLogDto: UpdateActivityLogDto,
  ) {
    const activityLog = await this.activityLogService.update(id, updateActivityLogDto);
    return ResponseService.buildResponse({ activityLog }, 'Activity log updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity log' })
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const activityLog = await this.activityLogService.delete(id);
    return ResponseService.buildResponse(activityLog, 'Activity log deleted successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all activity logs' })
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listActivityLogSchema, 'query'))
  async findAll(@Query() query: ListActivityLogDto, @Res() res: Response) {
    const result = await this.activityLogService.findAll(query);
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
