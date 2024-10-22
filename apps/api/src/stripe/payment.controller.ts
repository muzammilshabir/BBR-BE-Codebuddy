import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, createPaymentDtoSchema } from './dto/create-payment.dto';
import { CreateSubscriptionDto, createSubscriptionDtoSchema } from './dto/create-subscription.dto';
import { GetCurrentUserId } from 'src/auth/decorators/getCurrentUserId.decorator';
import { ChangeSubscriptionPaymentDto, changeSubscriptionPaymentDtoSchema } from './dto/change-subscription-payment-method.dto';
import { UpdateSubscriptionDto, UpdateSubscriptionDtoSchema } from './dto/update-subscription.dto';
import { CreateInvoiceDto, createInvoiceDtoSchema } from './dto/create-invoice.dto';
import { CreateInvoiceItemsDto, createInvoiceItemsDtoSchema } from './dto/create-invoice-items.dto';
import { CreateSubscriptionItemDto, createSubscriptionItemDtoSchema } from './dto/create-subscription-item.dto';
import { ListInvoicesDto, listInvoicesSchema } from './dto/list-invoices.dto';
import { UpdateSubscriptionItemDto, updateSubscriptionItemDtoSchema } from './dto/update-subscription-item.dto';
import { UpdateInvoiceItemDto, updateInvoiceItemsDtoSchema } from './dto/update-invoice-item.dto';
import { UpdateInvoiceDto, updateInvoiceDtoSchema } from './dto/update-invoice.dto';

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
  @UsePipes(new JoiValidationPipe(createSubscriptionItemDtoSchema, 'body'))
  async createInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionItemDto: CreateSubscriptionItemDto,
    ) {
    const intent = await this.paymentService.createSubscriptionItem(userId, createSubscriptionItemDto, false);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription created successfully');
  }

  @Patch('/invoice-subscription/:id')
  @ApiOperation({
    summary: 'Update Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(updateSubscriptionItemDtoSchema, 'body'))
  async updateInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateSubscriptionItemDto: UpdateSubscriptionItemDto,
    ) {
    const intent = await this.paymentService.updateSubscriptionItem(userId, id, updateSubscriptionItemDto);
    return ResponseService.buildResponse({ intent }, 'Invoice Subscription updated successfully');
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
    return ResponseService.buildResponse({ intent }, 'Payment Method created successfully');
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
    const intent = await this.paymentService.deletePaymentMethod(userId, methodId);
    return ResponseService.buildResponse({ intent }, 'Payment Method deleted successfully');
  }
  @Post('/subscription/')
  @ApiOperation({
    summary: 'Add one time payment to upcoming invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createSubscriptionDtoSchema, 'body'))
  async createSubscription(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    ) {
    const intent = await this.paymentService.createSubscription(userId, createSubscriptionDto);
    return ResponseService.buildResponse({ intent }, 'Subscription request created successfully');
  }

  @Post('/one-time/')
  @ApiOperation({
    summary: 'Create One-time Intent/Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createPaymentDtoSchema, 'body'))
  async createPayment(
    @GetCurrentUserId() userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    ) {
    const intent = await this.paymentService.createPayment(userId, createPaymentDto);
    return ResponseService.buildResponse({ intent }, 'Payment request created successfully');
  }

  @Post('/subscription/change-method')
  @ApiOperation({
    summary: 'Change Payment Method For Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(changeSubscriptionPaymentDtoSchema, 'body'))
  async changeSubscriptionPaymentMethods(
    @GetCurrentUserId() userId: string,
    @Body() changeSubscriptionPaymentDto: ChangeSubscriptionPaymentDto,
  ) {
    const paymentMethods = await this.paymentService.changeSubscriptionPaymentMethod(userId, changeSubscriptionPaymentDto);
    return ResponseService.buildResponse({ paymentMethods }, 'Payment Methods successfully');
  }

  @Put('/subscription/:residenceId')
  @ApiOperation({
    summary: 'Update Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(UpdateSubscriptionDtoSchema, 'body'))
  async updateSubscription(
    @GetCurrentUserId() userId: string,
    @Param('residenceId') residenceId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.paymentService.updateSubscription(userId, residenceId, updateSubscriptionDto);
    return ResponseService.buildResponse({ subscription }, 'Subscription Updated successfully');
  }
}
