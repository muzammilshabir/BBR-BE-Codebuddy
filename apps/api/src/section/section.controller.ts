import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
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
    return ResponseService.buildResponse(section, 'Section created successfully');
  }
}
