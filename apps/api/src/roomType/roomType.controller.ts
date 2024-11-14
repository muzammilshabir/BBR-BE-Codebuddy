import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomTypeService } from './roomType.service';
import { ListRoomTypeDto, listRoomTypeSchema } from './dto/listRoomType.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateRoomTypeDto, updateRoomTypeSchema } from './dto/updateRoomType.dto';
import { CreateRoomTypeDto, createRoomTypeSchema } from './dto/createRoomType.dto';

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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an RoomType by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateRoomTypeSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateRoomTypeDto: UpdateRoomTypeDto) {
    const updatedRoomType = await this.roomTypeService.update(id, updateRoomTypeDto);
    return ResponseService.buildResponse(updatedRoomType);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new RoomType',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createRoomTypeSchema, 'body'))
  async create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    const newRoomType = await this.roomTypeService.create(createRoomTypeDto);
    return ResponseService.buildResponse(newRoomType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get RoomType by ID',
  })
  @Public()
  async findById(@Param('id') id: string) {
    const roomType = await this.roomTypeService.findById(id);
    return ResponseService.buildResponse(roomType);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete RoomType by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const deletedRoomType = await this.roomTypeService.softDelete(id);
    return ResponseService.buildResponse(deletedRoomType);
  }
}
