import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModulePolicyService } from './modulePolicy.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListModulePolicyDto, listModulePolicySchema } from './dto/listModulePolicy.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { CreateModulePolicyDto, createModulePolicySchema } from './dto/createModulePolicy.dto';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { UpdateSectionDto, updateSectionSchema } from './dto/updateModulePolicy.dto';

@ApiTags('ModulePolicy')
@Controller('module-policy')
export class ModulePolicyController {
  constructor(private readonly modulePolicyService: ModulePolicyService) {}

  @Get()
  @ApiOperation({
    summary: 'List all modulePolicy',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listModulePolicySchema, 'query'))
  async list(@Query() listModulePolicyDto: ListModulePolicyDto) {
    const data = await this.modulePolicyService.findAll(listModulePolicyDto);
    return ResponseService.buildResponse(data);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new modulePolicy',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createModulePolicySchema, 'body'))
  async create(
    @Body() createModulePolicyDto: CreateModulePolicyDto,
    @GetCurrentUserId() userId: string
  ) {
    const modulePolicy = await this.modulePolicyService.create(createModulePolicyDto, userId);
    return ResponseService.buildResponse({ modulePolicy }, 'modulePolicy created successfully');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing modulePolicy',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateSectionSchema, 'body'))
  async update(
    @Param('id') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @GetCurrentUserId() userId: string
  ) {
    const modulePolicy = await this.modulePolicyService.update(sectionId, updateSectionDto, userId);
    return ResponseService.buildResponse({ modulePolicy }, 'modulePolicy updated successfully');
  }

  @Delete(':id/delete')
  @ApiOperation({
    summary: 'Delete a modulePolicy',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async deleteSection(@Param('id') sectionId: string, @GetCurrentUserId() userId: string) {
    const modulePolicy = await this.modulePolicyService.deleteSection(sectionId, userId);
    return ResponseService.buildResponse({ modulePolicy }, 'modulePolicy deleted successfully');
  }
}
