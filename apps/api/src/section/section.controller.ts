import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SectionService } from './section.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListSectionDto, listSectionSchema } from './dto/listSection.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { CreateSectionDto, createSectionSchema } from './dto/createSection.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { UpdateSectionDto, updateSectionSchema } from './dto/updateSection.dto';

@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  @ApiOperation({
    summary: 'List all Section',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listSectionSchema, 'query'))
  async list(@Query() listSectionDto: ListSectionDto) {
    const data = await this.sectionService.findAll(listSectionDto);
    return ResponseService.buildResponse(data);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new Section',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createSectionSchema, 'body'))
  async create(@Body() createSectionDto: CreateSectionDto, @GetCurrentUserId() userId: string) {
    const section = await this.sectionService.create(createSectionDto, userId);
    return ResponseService.buildResponse({ section }, 'Section created successfully');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing Section',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateSectionSchema, 'body'))
  async update(
    @Param('id') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @GetCurrentUserId() userId: string
  ) {
    const section = await this.sectionService.update(sectionId, updateSectionDto, userId);
    return ResponseService.buildResponse({ section }, 'Section updated successfully');
  }

  @Delete(':id/delete')
  @ApiOperation({
    summary: 'Delete a Section',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async deleteSection(@Param('id') sectionId: string, @GetCurrentUserId() userId: string) {
    const section = await this.sectionService.deleteSection(sectionId, userId);
    return ResponseService.buildResponse({ section }, 'Section deleted successfully');
  }
}
