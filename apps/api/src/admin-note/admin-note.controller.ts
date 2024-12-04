import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAdminNoteDto, createAdminNoteSchema } from './dto/create-admin-note.dto';
import { UpdateAdminNoteDto, updateAdminNoteSchema } from './dto/update-admin-note.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { ListAdminNoteDto } from './dto/list-admin-note.dto';
import { listAdminNoteSchema } from './dto/list-admin-note.dto';
import { AdminNoteService } from './admin-note.service';

@ApiTags('Admin Note')
@Controller('admin-note')
@ApiBearerAuth()
export class AdminNoteController {
  constructor(private readonly adminNoteService: AdminNoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create admin note' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createAdminNoteSchema, 'body'))
  async create(@Body() createAdminNoteDto: CreateAdminNoteDto) {
    const adminNote = await this.adminNoteService.create(createAdminNoteDto);
    return ResponseService.buildResponse({ adminNote }, 'Admin note created successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin note' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateAdminNoteSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateAdminNoteDto: UpdateAdminNoteDto) {
    const adminNote = await this.adminNoteService.update(id, updateAdminNoteDto);
    return ResponseService.buildResponse({ adminNote }, 'Admin note updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin note' })
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const adminNote = await this.adminNoteService.delete(id);
    return ResponseService.buildResponse(adminNote, 'Admin note deleted successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all admin notes' })
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listAdminNoteSchema, 'query'))
  async findAll(@Query() query: ListAdminNoteDto) {
    const result = await this.adminNoteService.findAll(query);
    return ResponseService.buildResponse(result, 'Admin notes retrieved successfully');
  }
}
