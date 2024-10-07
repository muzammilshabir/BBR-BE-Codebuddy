import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SectionService } from './section.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListSectionDto, listSectionSchema } from './dto/listSection.dto';

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
}
