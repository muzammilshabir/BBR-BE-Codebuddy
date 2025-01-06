import { Body, Controller, Post, UsePipes, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateInvoiceScheduleDto,
  createInvoiceScheduleSchema,
} from './dto/create-invoice-schedule.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { InvoiceScheduleService } from './invoiceSchedule.service';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GetInvoiceScheduleDto, getInvoiceScheduleSchema } from './dto/get-invoice-schedule.dto';

@ApiTags('Invoice Schedule')
@Controller('invoice-schedule')
export class InvoiceScheduleController {
  constructor(private readonly invoiceScheduleService: InvoiceScheduleService) {}

  @Post('')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create invoice schedule (Admin only)' })
  @UsePipes(new JoiValidationPipe(createInvoiceScheduleSchema, 'body'))
  async createInvoiceScheduleByAdmin(@Body() createInvoiceScheduleDto: CreateInvoiceScheduleDto) {
    const invoiceSchedule =
      await this.invoiceScheduleService.createInvoiceSchedule(createInvoiceScheduleDto);
    return ResponseService.buildResponse(
      { invoiceSchedule },
      'Invoice schedule created successfully'
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice schedule by developer and residence' })
  @UsePipes(new JoiValidationPipe(getInvoiceScheduleSchema, 'query'))
  async getInvoiceSchedule(@Query() getInvoiceScheduleDto: GetInvoiceScheduleDto) {
    const { developerId, residenceId } = getInvoiceScheduleDto;
    const invoiceSchedule = await this.invoiceScheduleService.getInvoiceSchedule(
      developerId,
      residenceId
    );
    return ResponseService.buildResponse(
      { invoiceSchedule },
      'Invoice schedule retrieved successfully'
    );
  }
}
