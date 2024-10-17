import { Body, Controller, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { CreateRoleDto, createRoleSchema } from './dto/addRoleDto';
import { UpdateRoleDto, updateRoleSchema } from './dto/updateRoleDto';
import { ListRoleDto, ListRoleSchema } from './dto/listRole.dto';
import { GetRoleByIdDto, getRoleByIdSchema } from './dto/getRoleById.dto';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({
    summary: 'Add new role',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createRoleSchema, 'body'))
  async createRole(@GetCurrentUserId() userId: string, @Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.createRole(userId, createRoleDto);
    return ResponseService.buildResponse({ role }, 'New role added successfully');
  }

  @Put(':roleId')
  @ApiOperation({
    summary: 'Update an existing role',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateRoleSchema, 'body'))
  async updateRole(
    @Param('roleId') roleId: string,
    @GetCurrentUserId() userId: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    const role = await this.roleService.updateRole(roleId, updateRoleDto, userId);
    return ResponseService.buildResponse({ role }, 'Role updated successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'List all roles',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(ListRoleSchema, 'query'))
  async list(@Query() roleDto: ListRoleDto) {
    const data = await this.roleService.findAll(roleDto);
    return ResponseService.buildResponse(data);
  }

  @Get(':roleId')
  @ApiOperation({
    summary: 'get role by id',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getRoleByIdSchema, 'param'))
  async getRoleById(@Param() getRoleByIdDto: GetRoleByIdDto) {
    const data = await this.roleService.getRoleById(getRoleByIdDto);
    return ResponseService.buildResponse(data);
  }
}
