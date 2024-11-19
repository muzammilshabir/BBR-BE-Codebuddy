import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListLifeStyleService } from './lifeStyles.service';
import { ListLifeStylesDto, listLifeStylesSchema } from './dto/listLifeStyles.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateLifeStyleDto, updateLifeStyleSchema } from './dto/updateLifeStyle.dto';
import { GetLifeStyleByIdDto, getLifeStyleByIdSchema } from './dto/get-lifeStyle-by-id.dto';

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

  @Get(':id')
  @ApiOperation({
    summary: 'Get a LifeStyle by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getLifeStyleByIdSchema, 'param'))
  async findById(@Param() getLifeStyleByIdDto: GetLifeStyleByIdDto) {
    const data = await this.lifeStylesService.findById(getLifeStyleByIdDto.id);
    return ResponseService.buildResponse(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an LifeStyle by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateLifeStyleSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateLifeStyleDto: UpdateLifeStyleDto) {
    const updatedLifeStyle = await this.lifeStylesService.update(id, updateLifeStyleDto);
    return ResponseService.buildResponse(updatedLifeStyle);
  }
}
