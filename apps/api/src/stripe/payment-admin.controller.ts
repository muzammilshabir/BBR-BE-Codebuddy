import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { PaymentService } from './payment.service';
import { RefundPaymentDto, refundPaymentDtoSchema } from './dto/refund-payment.dto';
import { ListInvoicesDto, listInvoicesSchema } from './dto/list-invoices.dto';
import { UpdateSubscriptionItemDto, updateSubscriptionItemDtoSchema } from './dto/update-subscription-item.dto';
import { GetCurrentUserId } from 'src/auth/decorators/getCurrentUserId.decorator';
import { CreateSubscriptionItemDto, createSubscriptionItemDtoSchema } from './dto/create-subscription-item.dto';
import { UpdateInvoiceItemDto, updateInvoiceItemsDtoSchema } from './dto/update-invoice-item.dto';
import { CreateInvoiceItemsDto, createInvoiceItemsDtoSchema } from './dto/create-invoice-items.dto';
import { UpdateInvoiceDto, updateInvoiceDtoSchema } from './dto/update-invoice.dto';
import { CreateInvoiceDto, createInvoiceDtoSchema } from './dto/create-invoice.dto';

@ApiTags('Payment/admin')
@Controller('payment/admin')
export class PaymentAdminController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post('/invoice/')
  @ApiOperation({
    summary: 'Generate Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createInvoiceDtoSchema, 'body'))
  async createInvoice(
    @GetCurrentUserId() userId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
    ) {
    const intent = await this.paymentService.createInvoice(userId, createInvoiceDto, true);
    return ResponseService.buildResponse({ intent }, 'Invoice created successfully');
  }

  @Patch('/invoice/:id')
  @ApiOperation({
    summary: 'Update Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateInvoiceDtoSchema, 'body'))
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    ) {
    const intent = await this.paymentService.updateInvoiceAdmin(id, updateInvoiceDto);
    return ResponseService.buildResponse({ intent }, 'Invoice updated successfully');
  }

  @Get('/invoice/send-email/:id')
  @ApiOperation({
    summary: 'Send Invoice Email',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateInvoiceDtoSchema, 'body'))
  async sendInvoiceEmail(
    @Param('id') id: string,
    ) {
    const intent = await this.paymentService.sendInvoiceEmail(id);
    return ResponseService.buildResponse({ intent }, 'Invoice Email successfully');
  }

  @Post('/invoice-items/')
  @ApiOperation({
    summary: 'Create Invoice Items',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createInvoiceItemsDtoSchema, 'body'))
  async createInvoiceItems(
    @GetCurrentUserId() userId: string,
    @Body() createInvoiceItemsDto: CreateInvoiceItemsDto,
    ) {
    const intent = await this.paymentService.createInvoiceItems(userId, createInvoiceItemsDto, true);
    return ResponseService.buildResponse({ intent }, 'Invoice Items created successfully');
  }

  @Patch('/invoice-item/:id')
  @ApiOperation({
    summary: 'Update Invoice Item',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateInvoiceItemsDtoSchema, 'body'))
  async updateInvoiceItem(
    @Param('id') id: string,
    @Body() updateInvoiceItemDto: UpdateInvoiceItemDto,
    ) {
    const intent = await this.paymentService.updateInvoiceItemAdmin(id, updateInvoiceItemDto);
    return ResponseService.buildResponse({ intent }, 'Invoice Item updated successfully');
  }

  @Post('/invoice-subscription/')
  @ApiOperation({
    summary: 'Create Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createSubscriptionItemDtoSchema, 'body'))
  async createInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionItemDto: CreateSubscriptionItemDto,
    ) {
    const intent = await this.paymentService.createSubscriptionItem(userId, createSubscriptionItemDto, true);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription created successfully');
  }

  @Patch('/invoice-subscription/:id')
  @ApiOperation({
    summary: 'Update Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateSubscriptionItemDtoSchema, 'body'))
  async updateInvoiceSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionItemDto: UpdateSubscriptionItemDto,
    ) {
    const intent = await this.paymentService.updateSubscriptionItemAdmin(id, updateSubscriptionItemDto);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription updated successfully');
  }

  @Get('/invoices/:userId')
  @ApiOperation({
    summary: 'Get Customer Invoices',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listInvoicesSchema, 'query'))
  async getCustomerInvoicesAdmin(
    @Param('userId') userId: string,
    @Query() query: ListInvoicesDto,
  ) {
    const invoices = await this.paymentService.getUserInvoices(userId, query);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoices retrieved successfully');
  }

  @Get('/invoices/')
  @ApiOperation({
    summary: 'Get ALL Invoices',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listInvoicesSchema, 'query'))
  async getCustomerInvoices(
    @Query() query: ListInvoicesDto,
  ) {
    const invoices = await this.paymentService.getAllInvoices(query);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoices retrieved successfully');
  }

  @Get('/invoice/:invoiceId')
  @ApiOperation({
    summary: 'Get Customer Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerInvoice(
    @Param('invoiceId') invoiceId: string,
  ) {
    const invoices = await this.paymentService.getUserInvoiceAdmin(invoiceId);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoice retrieved successfully');
  }

  @Post('/refund/:invoiceId')
  @ApiOperation({
    summary: 'Refund/Cancel Customer Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(refundPaymentDtoSchema, 'body'))
  async refundCustomerInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    const refund = await this.paymentService.refundUserInvoice(invoiceId, refundPaymentDto);
    return ResponseService.buildResponse({ refund }, 'Invoice refunded successfully');
  }
  
  @Get('/customer/payment-methods/:userId')
  @ApiOperation({
    summary: 'Get Customer Payment Methods',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerPaymentMethods(
    @Param('userId') userId: string,
  ) {
    const paymentMethods = await this.paymentService.getUserPaymentMethods(userId);
    return ResponseService.buildResponse({ paymentMethods }, 'Customer Payment Methods successfully');
  }

  @Delete('/payment-method/:userId/:methodId')
  @ApiOperation({
    summary: 'Delete Payment Method',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async deletePaymentMethod(
    @Param('userId') userId: string,
    @Param('methodId') methodId: string,
  ) {
    const intent = await this.paymentService.deletePaymentMethod(userId, methodId);
    return ResponseService.buildResponse({ intent }, 'Payment Method deleted successfully');
  }

  @Get('/customers')
  @ApiOperation({
    summary: 'Get Customers',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomers() {
    const customers = await this.paymentService.listCustomers();
    return ResponseService.buildResponse({ customers }, 'Customers retrieved successfully');
  }
}
