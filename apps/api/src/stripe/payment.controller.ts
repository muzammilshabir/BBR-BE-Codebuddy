import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, createPaymentDtoSchema } from './dto/create-payment.dto';
import { CreateSubscriptionDto, createSubscriptionDtoSchema } from './dto/create-subscription.dto';
import { GetCurrentUserId } from 'src/auth/decorators/getCurrentUserId.decorator';
import { RefundPaymentDto, refundPaymentDtoSchema } from './dto/refund-payment.dto';
import { ChangeSubscriptionPaymentDto, changeSubscriptionPaymentDtoSchema } from './dto/change-subscription-payment-method.dto';
import { UpdateSubscriptionDto, UpdateSubscriptionDtoSchema } from './dto/update-subscription.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post('/subscription/')
  @ApiOperation({
    summary: 'Create Subscription Intent/Invoice',
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

  @Get('/invoices/')
  @ApiOperation({
    summary: 'Get Customer Invoices',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async getCustomerInvoices(
    @GetCurrentUserId() userId: string,
  ) {
    const invoices = await this.paymentService.getUserInvoices(userId);
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

  @Get('/admin/customer-portal/session/:userId')
  @ApiOperation({
    summary: 'Create Customer Portal Session As Admin',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async createCustomerPortalAsAdmin(
    @Param('userId') userId: string,
    ) {
    const session = await this.paymentService.createCustomerPortalSession(userId);
    return ResponseService.buildResponse({ session }, 'Customer Portal session created successfully');
  }

  @Get('/admin/customers')
  @ApiOperation({
    summary: 'Get Customers',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomers() {
    const customers = await this.paymentService.listCustomers();
    return ResponseService.buildResponse({ customers }, 'Customers retrieved successfully');
  }

  @Get('/admin/customer/payment-methods/:userId')
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

  @Get('/admin/customer/payments/:userId')
  @ApiOperation({
    summary: 'Get Customer Payments',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerPayments(
    @Param('userId') userId: string,
  ) {
    const payments = await this.paymentService.getUserPayments(userId);
    return ResponseService.buildResponse({ payments }, 'Customer Payments retrieved successfully');
  }

  @Get('/admin/customer/subscriptions/:userId')
  @ApiOperation({
    summary: 'Get Customer Subscriptions',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerSubscriptions(
    @Param('userId') userId: string,
  ) {
    const subscriptions = await this.paymentService.getUserSubscriptions(userId);
    return ResponseService.buildResponse({ subscriptions }, 'Customer Subscriptions retrieved successfully');
  }

  @Get('/admin/customer/invoices/:userId')
  @ApiOperation({
    summary: 'Get Customer Invoices',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerInvoicesAdmin(
    @Param('userId') userId: string,
  ) {
    const invoices = await this.paymentService.getUserInvoices(userId);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoices retrieved successfully');
  }

  @Get('/admin/customer/invoice/:invoiceId')
  @ApiOperation({
    summary: 'Get Customer Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerInvoiceAdmin(
    @Param('invoiceId') invoiceId: string,
  ) {
    const invoices = await this.paymentService.getUserInvoiceAdmin(invoiceId);
    return ResponseService.buildResponse({ invoices }, 'Customer Invoice retrieved successfully');
  }

  @Post('/admin/refund/:invoiceId')
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
}
