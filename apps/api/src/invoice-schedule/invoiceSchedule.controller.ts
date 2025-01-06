import { Body, Controller, Post, UsePipes } from '@nestjs/common';
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
}
