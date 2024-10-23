import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { PaymentService } from './payment.service';
import { RefundPaymentDto, refundPaymentDtoSchema } from './dto/refund-payment.dto';
import { ListInvoicesDto, listInvoicesSchema } from './dto/list-invoices.dto';
import { GetCurrentUserId } from 'src/auth/decorators/getCurrentUserId.decorator';
import { CreateSubscriptionDto, createSubscriptionDtoSchema } from './dto/create-subscription.dto';
import { UpdateInvoiceItemDto, updateInvoiceItemsDtoSchema } from './dto/update-invoice-item.dto';
import { CreateInvoiceItemsDto, createInvoiceItemsDtoSchema } from './dto/create-invoice-items.dto';
import { UpdateInvoiceDto, updateInvoiceDtoSchema } from './dto/update-invoice.dto';
import { CreateInvoiceDto, createInvoiceDtoSchema } from './dto/create-invoice.dto';
import { UpdateSubscriptionDto, updateSubscriptionDtoSchema } from './dto/update-subscription.dto';
import { RefundStatus } from './enum/refund-status.enum';
import { ListTransactionsDto, listTransactionsDtoSchema } from './dto/list-transactions.dto';

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
    return ResponseService.buildResponse({ intent }, 'Invoice Email sent successfully');
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
  @UsePipes(new JoiValidationPipe(createSubscriptionDtoSchema, 'body'))
  async createInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    ) {
    const intent = await this.paymentService.createSubscription(userId, createSubscriptionDto, true);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription created successfully');
  }

  @Patch('/invoice-subscription/:id')
  @ApiOperation({
    summary: 'Update Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateSubscriptionDtoSchema, 'body'))
  async updateInvoiceSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    ) {
    const intent = await this.paymentService.updateSubscriptionAdmin(id, updateSubscriptionDto);
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

  @Get('/alerts/')
  @ApiOperation({
    summary: 'Get Alerts',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getAlerts(
  ) {
    const alerts = await this.paymentService.getAlerts();
    return ResponseService.buildResponse({ alerts }, 'Alerts retrieved successfully');
  }

  @Get('/manage-alert/:alertId')
  @ApiOperation({
    summary: 'Mark Alert as managed',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async manageAlert(
    @Param('alertId') alertId: string
  ) {
    const alert = await this.paymentService.manageAlert(alertId);
    return ResponseService.buildResponse({ alert }, 'Alert marked as managed successfully');
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

  @Get('/transactions/:userId')
  @ApiOperation({
    summary: 'Get Transaction',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listTransactionsDtoSchema, 'query'))
  async getTransactions(
    @Param('userId') userId: string,
    @Query() listTransactionsDto: ListTransactionsDto,
  ) {
    const paymentMethods = await this.paymentService.getTransactions(userId, listTransactionsDto);
    return ResponseService.buildResponse({ paymentMethods }, 'Transactions retrieved successfully');
  }

  @Get('/transactions/:residenceId')
  @ApiOperation({
    summary: 'Get Transactions By Residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listTransactionsDtoSchema, 'query'))
  async getTransactionsByResidence(
    @Param('residenceId') residenceId: string,
    @Query() listTransactionsDto: ListTransactionsDto,
  ) {
    const paymentMethods = await this.paymentService.getTransactionsForResidence(residenceId, listTransactionsDto);
    return ResponseService.buildResponse({ paymentMethods }, 'Transactions retrieved successfully');
  }

  @Get('/transaction/:transactionId')
  @ApiOperation({
    summary: 'Get Single Transaction',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getTransaction(
    @Param('transactionId') transactionId: string,
  ) {
    const paymentMethods = await this.paymentService.getTransaction(transactionId);
    return ResponseService.buildResponse({ paymentMethods }, 'Transaction retrieved successfully');
  }


  @Post('/refund-request/:refundId/accept')
  @ApiOperation({
    summary: 'Accept Customer Invoice Refund Request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async acceptRefundRequest(
    @Param('refundId') refundId: string,
  ) {
    const refund = await this.paymentService.acceptRejectInvoiceRefund(refundId, RefundStatus.REFUNDED);
    return ResponseService.buildResponse({ refund }, 'Invoice refunded successfully');
  }

  @Post('/refund-request/:refundId/reject')
  @ApiOperation({
    summary: 'Reject Customer Invoice Refund Request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async rejectRefundRequest(
    @Param('refundId') refundId: string,
  ) {
    const refund = await this.paymentService.acceptRejectInvoiceRefund(refundId, RefundStatus.REJECTED);
    return ResponseService.buildResponse({ refund }, 'Invoice refund rejected successfully');
  }

  @Post('/refund/:invoiceId')
  @ApiOperation({
    summary: 'Refund Customer Invoice',
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
    return ResponseService.buildResponse({ paymentMethods }, 'Customer Payment Methods retrieved successfully');
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
