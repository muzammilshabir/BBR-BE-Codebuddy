import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { PaymentService } from './payment.service';
import { GetCurrentUserId } from 'src/auth/decorators/getCurrentUserId.decorator';
import { CreateInvoiceDto, createInvoiceDtoSchema } from './dto/create-invoice.dto';
import { CreateInvoiceItemsDto, createInvoiceItemsDtoSchema } from './dto/create-invoice-items.dto';
import { CreateSubscriptionDto, createSubscriptionDtoSchema } from './dto/create-subscription.dto';
import { ListInvoicesDto, listInvoicesSchema } from './dto/list-invoices.dto';
import { UpdateSubscriptionDto, updateSubscriptionDtoSchema } from './dto/update-subscription.dto';
import { UpdateInvoiceItemDto, updateInvoiceItemsDtoSchema } from './dto/update-invoice-item.dto';
import { UpdateInvoiceDto, updateInvoiceDtoSchema } from './dto/update-invoice.dto';
import { RefundPaymentDto, refundPaymentDtoSchema } from './dto/refund-payment.dto';
import { ListTransactionsDto, listTransactionsDtoSchema } from './dto/list-transactions.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}
  @Get('/invoices/')
  @ApiOperation({
    summary: 'Get Customer Invoices',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(listInvoicesSchema, 'query'))
  async getCustomerInvoices(
    @GetCurrentUserId() userId: string,
    @Query() query: ListInvoicesDto,
  ) {
    const invoices = await this.paymentService.getUserInvoices(userId, query);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoices retrieved successfully');
  }

  @Get('/invoice/:invoiceId')
  @ApiOperation({
    summary: 'Get Customer Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async getCustomerInvoice(
    @GetCurrentUserId() userId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    const invoices = await this.paymentService.getUserInvoice(userId, invoiceId);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoice retrieved successfully');
  }

  @Post('/invoice/')
  @ApiOperation({
    summary: 'Generate Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createInvoiceDtoSchema, 'body'))
  async createInvoice(
    @GetCurrentUserId() userId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
    ) {
    const intent = await this.paymentService.createInvoice(userId, createInvoiceDto, false);
    return ResponseService.buildResponse({ intent }, 'Invoice created successfully');
  }

  @Patch('/invoice/:id')
  @ApiOperation({
    summary: 'Update Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(updateInvoiceDtoSchema, 'body'))
  async updateInvoice(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    ) {
    const intent = await this.paymentService.updateInvoice(userId, id, updateInvoiceDto);
    return ResponseService.buildResponse({ intent }, 'Invoice updated successfully');
  }

  @Post('/invoice-items/')
  @ApiOperation({
    summary: 'Create Invoice Items',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createInvoiceItemsDtoSchema, 'body'))
  async createInvoiceItems(
    @GetCurrentUserId() userId: string,
    @Body() createInvoiceItemsDto: CreateInvoiceItemsDto,
    ) {
    const intent = await this.paymentService.createInvoiceItems(userId, createInvoiceItemsDto, false);
    return ResponseService.buildResponse({ intent }, 'Invoice Items created successfully');
  }

  @Patch('/invoice-item/:id')
  @ApiOperation({
    summary: 'Update Invoice Item',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(updateInvoiceItemsDtoSchema, 'body'))
  async updateInvoiceItem(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateInvoiceItemDto: UpdateInvoiceItemDto,
    ) {
    const intent = await this.paymentService.updateInvoiceItem(userId, id, updateInvoiceItemDto);
    return ResponseService.buildResponse({ intent }, 'Invoice Item updated successfully');
  }

  @Post('/invoice-subscription/')
  @ApiOperation({
    summary: 'Create Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createSubscriptionDtoSchema, 'body'))
  async createInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    ) {
    const intent = await this.paymentService.createSubscription(userId, createSubscriptionDto, false);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription created successfully');
  }

  @Patch('/invoice-subscription/:id')
  @ApiOperation({
    summary: 'Update Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(updateSubscriptionDtoSchema, 'body'))
  async updateInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    ) {
    const intent = await this.paymentService.updateSubscription(userId, id, updateSubscriptionDto);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription updated successfully');
  }

  @Post('/request-refund/:invoiceId')
  @ApiOperation({
    summary: 'Request Refund for Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(refundPaymentDtoSchema, 'body'))
  async requestRefund(
    @GetCurrentUserId() userId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    const intent = await this.paymentService.requestInvoiceRefund(userId, invoiceId, refundPaymentDto);
    return ResponseService.buildResponse({ intent }, 'Refund request created successfully');
  }

  @Get('/transactions/')
  @ApiOperation({
    summary: 'Get Transaction',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(listTransactionsDtoSchema, 'query'))
  async getTransactions(
    @GetCurrentUserId() userId: string,
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
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(listTransactionsDtoSchema, 'query'))
  async getTransactionsByResidence(
    @GetCurrentUserId() userId: string,
    @Param('residenceId') residenceId: string,
    @Query() listTransactionsDto: ListTransactionsDto,
  ) {
    const paymentMethods = await this.paymentService.getTransactionsForResidence(residenceId, listTransactionsDto, userId);
    return ResponseService.buildResponse({ paymentMethods }, 'Transactions retrieved successfully');
  }

  @Get('/transaction/:transactionId')
  @ApiOperation({
    summary: 'Get Single Transaction',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async getTransaction(
    @GetCurrentUserId() userId: string,
    @Param('transactionId') transactionId: string,
  ) {
    const paymentMethods = await this.paymentService.getTransaction(userId, transactionId);
    return ResponseService.buildResponse({ paymentMethods }, 'Transaction retrieved successfully');
  }

  @Get('/payment-methods/')
  @ApiOperation({
    summary: 'Get Payment Methods',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async getPaymentMethods(
    @GetCurrentUserId() userId: string,
  ) {
    const paymentMethods = await this.paymentService.getUserPaymentMethods(userId);
    return ResponseService.buildResponse({ paymentMethods }, 'Payment Methods retrieved successfully');
  }

  @Post('/payment-method/')
  @ApiOperation({
    summary: 'Create Payment Method Setup Intent',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async createSetupIntent(
    @GetCurrentUserId() userId: string,
  ) {
    const intent = await this.paymentService.createSetupIntent(userId);
    return ResponseService.buildResponse({ intent }, 'Setup intent created successfully');
  }

  @Delete('/payment-method/:methodId')
  @ApiOperation({
    summary: 'Delete Payment Method',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async deletePaymentMethod(
    @GetCurrentUserId() userId: string,
    @Param('methodId') methodId: string,
  ) {
    const method = await this.paymentService.deletePaymentMethod(userId, methodId);
    return ResponseService.buildResponse({ method }, 'Payment Method deleted successfully');
  }

  @Patch('/payment-method-default/:methodId/:residenceId')
  @ApiOperation({
    summary: 'Set default payment method for residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async setDefaultResidencePaymentMethod(
    @GetCurrentUserId() userId: string,
    @Param('methodId') methodId: string,
    @Param('residenceId') residenceId: string,
  ) {
    const residence = await this.paymentService.setDefaultResidencePaymentMethod(methodId, residenceId, userId);
    return ResponseService.buildResponse({ residence }, 'Default Residence Payment Method set successfully');
  }

}
