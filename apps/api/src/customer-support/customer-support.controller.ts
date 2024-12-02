import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerSupportService } from './customer-support.service';
import {
  CreateCustomerSupportDto,
  createCustomerSupportSchema,
} from './dto/create-customer-support.dto';
import { ListCustomerSupportDto, listCustomerSupportSchema } from './dto/list-customer-support.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import {
  UpdateCustomerSupportDto,
  updateCustomerSupportSchema,
} from './dto/update-customer-support.dto';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionLevel } from 'src/modulePolicy/enum/permission-enum';

@ApiTags('CustomerSupport')
@Controller('customer-support')
export class CustomerSupportController {
  constructor(private readonly customerSupportService: CustomerSupportService) {}

  @Post()
  @ApiOperation({ summary: 'Create Customer Support' })
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Permissions('customer-support', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(createCustomerSupportSchema, 'body'))
  async create(@Body() createCustomerSupportDto: CreateCustomerSupportDto) {
    const customerSupport = await this.customerSupportService.create(createCustomerSupportDto);
    return ResponseService.buildResponse(
      { customerSupport },
      'Customer support created successfully'
    );
  }

  @Post('/list')
  @ApiOperation({ summary: 'List customer support filters' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('customer-support', PermissionLevel.READ)
  @UsePipes(new JoiValidationPipe(listCustomerSupportSchema, 'body'))
  async listCustomerSupports(
    @Body() body: ListCustomerSupportDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const customerSupports = await this.customerSupportService.getCustomerSupportsWithRole(
      body,
      user
    );
    return ResponseService.buildResponse(
      { customerSupports },
      'Customer supports retrieved successfully'
    );
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update Customer Support' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('customer-support', PermissionLevel.EDIT)
  @UsePipes(new JoiValidationPipe(updateCustomerSupportSchema, 'body'))
  async updateCustomerSupport(
    @Param('id') customerSupportId: string,
    @Body() updateCustomerSupportDto: UpdateCustomerSupportDto
  ) {
    const customerSupport = await this.customerSupportService.updateCustomerSupport(
      customerSupportId,
      updateCustomerSupportDto
    );
    return ResponseService.buildResponse(
      { customerSupport },
      'Customer support updated successfully'
    );
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get Customer Support by ID' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('customer-support', PermissionLevel.READ)
  async getCustomerSupportById(
    @Param('id') customerSupportId: string,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const customerSupport = await this.customerSupportService.getCustomerSupportWithRole(
      customerSupportId,
      user
    );
    return ResponseService.buildResponse(
      { customerSupport },
      'Customer support retrieved successfully'
    );
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete Customer Support' })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Permissions('customer-support', PermissionLevel.DELETE)
  async deleteCustomerSupport(@Param('id') customerSupportId: string) {
    const customerSupport = await this.customerSupportService.deleteCustomerSupport(customerSupportId);
    return ResponseService.buildResponse(
      { customerSupport },
      'Customer support deleted successfully'
    );
  }
}
