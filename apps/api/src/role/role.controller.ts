import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { CreateRoleDto, createRoleSchema } from './dto/addRoleDto';

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
}
