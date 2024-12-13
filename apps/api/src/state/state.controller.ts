import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StateService } from './state.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Public } from 'src/auth/decorators/public.decorator';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { UserRole } from 'src/users/enum/user.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ListStateDto, listStateSchema } from './dto/listState.dto';
import { UpdateStateDto, updateStateSchema } from './dto/updateState.dto';
import { GetByIdDto, getIdSchema } from 'src/city/dto/getById.dto';

@ApiTags('State')
@Controller('state')
export class StateController {
    constructor(private readonly stateService: StateService) {}

    
  @Get()
  @ApiOperation({
    summary: 'List all state',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listStateSchema, 'query'))
  async list(@Query() listStateDto: ListStateDto) {
    const data = await this.stateService.findAll(listStateDto);
    return ResponseService.buildResponse(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an State by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateStateSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    const updatedState = await this.stateService.update(id, updateStateDto);
    return ResponseService.buildResponse(updatedState);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get State by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getIdSchema, 'param'))
  async getResidenceById(@Param() params: GetByIdDto) {
    const state = await this.stateService.getStateById(params.id);
    return ResponseService.buildResponse({ state }, 'state retrieved successfully');
  }
    
}
