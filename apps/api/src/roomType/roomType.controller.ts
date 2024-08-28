import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomTypeService } from './roomType.service';
import { ListRoomTypeDto, listRoomTypeSchema } from './dto/listResidenceType.dto';

@ApiTags('RoomType')
@Controller('room-type')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Get()
  @ApiOperation({
    summary: 'List all RoomType',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listRoomTypeSchema, 'query'))
  async list(@Query() listRoomTypeDto: ListRoomTypeDto) {
    const data = await this.roomTypeService.findAll(listRoomTypeDto);
    return ResponseService.buildResponse(data);
  }
}
