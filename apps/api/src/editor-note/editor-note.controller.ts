import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEditorNoteDto, createEditorNoteSchema } from './dto/create-editor-note.dto';
import { UpdateEditorNoteDto, updateEditorNoteSchema } from './dto/update-editor-note.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { ListEditorEditorDto } from './dto/list-editor-note.dto';
import { listEditorNoteSchema } from './dto/list-editor-note.dto';
import { EditorNoteService } from './editor-note.service';
import { Public } from '../../../../packages/api-core/modules/decorators';
import {
  GetReviewsByResidenceIdDto,
  getReviewsByResidenceIdSchema,
} from '../reviews/dto/get-reviews-by-residence-id.dto';

@ApiTags('Editor Note')
@Controller('editor-note')
@ApiBearerAuth()
export class EditorNoteController {
  constructor(private readonly editorNoteService: EditorNoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create editor note' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createEditorNoteSchema, 'body'))
  async create(@Body() createEditorNoteDto: CreateEditorNoteDto) {
    const editorNote = await this.editorNoteService.create(createEditorNoteDto);
    return ResponseService.buildResponse({ editorNote }, 'Editor note created successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update editor note' })
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateEditorNoteSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateEditorNoteDto: UpdateEditorNoteDto) {
    const editorNote = await this.editorNoteService.update(id, updateEditorNoteDto);
    return ResponseService.buildResponse({ editorNote }, 'Editor note updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete editor note' })
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const editorNote = await this.editorNoteService.delete(id);
    return ResponseService.buildResponse(editorNote, 'Editor note deleted successfully');
  }

  @Get(':residenceId')
  @ApiOperation({ summary: 'Get editor note by residence id' })
  @Public()
  @UsePipes(new JoiValidationPipe(getReviewsByResidenceIdSchema, 'query'))
  async findByResidenceId(@Query() query: GetReviewsByResidenceIdDto) {
    const result = await this.editorNoteService.findByResidenceId(query.residenceId);
    return ResponseService.buildResponse(result, 'Editor note retrieved successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all editor notes' })
  @Public()
  @UsePipes(new JoiValidationPipe(listEditorNoteSchema, 'query'))
  async findAll(@Query() query: ListEditorEditorDto) {
    const result = await this.editorNoteService.findAll(query);
    return ResponseService.buildResponse(result, 'Editor notes retrieved successfully');
  }
}
