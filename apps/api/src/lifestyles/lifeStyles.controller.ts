import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListLifeStyleService } from './lifeStyles.service';
import { ListLifeStylesDto, listLifeStylesSchema } from './dto/listLifeStyles.dto';

@ApiTags('LifeStyle')
@Controller('lifestyles')
export class LifeStyleController {
  constructor(private readonly lifeStylesService: ListLifeStyleService) {}

  @Get()
  @ApiOperation({
    summary: 'List all LifeStyles',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listLifeStylesSchema, 'query'))
  async list(@Query() listLifeStylesDto: ListLifeStylesDto) {
    const data = await this.lifeStylesService.findAll(listLifeStylesDto);
    return ResponseService.buildResponse(data);
  }
}
