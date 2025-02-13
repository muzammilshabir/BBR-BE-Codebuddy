import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  CreateMessageScheduleDto,
  createMessageScheduleSchema,
} from './dto/create-message-schedule.dto';
import { MessageScheduleService } from './message-schedule.service';

@ApiTags('Message Schedule')
@Controller('message-schedule')
@ApiBearerAuth()
export class MessageScheduleController {
  constructor(private readonly messageScheduleService: MessageScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new message' })
  @UsePipes(new JoiValidationPipe(createMessageScheduleSchema, 'body'))
  async create(@Body() createMessageScheduleDto: CreateMessageScheduleDto) {
    const messageSchedule = await this.messageScheduleService.create(createMessageScheduleDto);
    return ResponseService.buildResponse({ messageSchedule }, 'Message scheduled successfully');
  }
}
