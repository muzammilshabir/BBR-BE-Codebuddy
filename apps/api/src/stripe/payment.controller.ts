import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Param, Post, UsePipes } from '@nestjs/common';
import {  ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, createPaymentDtoSchema } from './dto/create-payment.dto';
import { CreateSubscriptionDto, createSubscriptionDtoSchema } from './dto/create-subscription.dto';
import { GetCurrentUserId } from 'src/auth/decorators/getCurrentUserId.decorator';

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
  @Roles(UserRole.BUYER)
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
  @Roles(UserRole.BUYER)
  @UsePipes(new JoiValidationPipe(createPaymentDtoSchema, 'body'))
  async createPayment(
    @GetCurrentUserId() userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    ) {
    const intent = await this.paymentService.createPayment(userId, createPaymentDto);
    return ResponseService.buildResponse({ intent }, 'Payment request created successfully');
  }

  @Post('/subscription/session')
  @ApiOperation({
    summary: 'Create Subscription Session',
  })
  @ApiBearerAuth()
  @Roles(UserRole.BUYER)
  @UsePipes(new JoiValidationPipe(createSubscriptionDtoSchema, 'body'))
  async createSubscriptionSession(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    ) {
    const session = await this.paymentService.createSubscriptionSession(userId, createSubscriptionDto);
    return ResponseService.buildResponse({ session }, 'Subscription session created successfully');
  }

  @Post('/one-time/session')
  @ApiOperation({
    summary: 'Create One-time Payment Session',
  })
  @ApiBearerAuth()
  @Roles(UserRole.BUYER)
  @UsePipes(new JoiValidationPipe(createPaymentDtoSchema, 'body'))
  async createPaymentSession(
    @GetCurrentUserId() userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    ) {
    const session = await this.paymentService.createPaymentSession(userId, createPaymentDto);
    return ResponseService.buildResponse({ session }, 'Payment session created successfully');
  }

  @Post('/customer-portal/session')
  @ApiOperation({
    summary: 'Create Customer Portal Session',
  })
  @ApiBearerAuth()
  @Roles(UserRole.BUYER)
  async createCustomerPortalSession(
    @GetCurrentUserId() userId: string,
    ) {
    const session = await this.paymentService.createCustomerPortalSession(userId);
    return ResponseService.buildResponse({ session }, 'Customer Portal session created successfully');
  }

  @Post('/admin/customer-portal/session/:userId')
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

  @Post('/admin/customers')
  @ApiOperation({
    summary: 'Get Customers',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomers() {
    const customers = await this.paymentService.listCustomers();
    return ResponseService.buildResponse({ customers }, 'Customers retrieved successfully');
  }

  @Post('/admin/customer/payment-methods/:userId')
  @ApiOperation({
    summary: 'Get Customer Payment Methods',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerPaymentMethods(
    @Param('userId') userId: string,
  ) {
    const paymentMethods = await this.paymentService.getUserPaymentMethods(userId);
    return ResponseService.buildResponse({ paymentMethods }, 'Customers Payment Methods successfully');
  }

  @Post('/admin/customer/payments/:userId')
  @ApiOperation({
    summary: 'Get Customer Payments',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerPayments(
    @Param('userId') userId: string,
  ) {
    const payments = await this.paymentService.getUserPayments(userId);
    return ResponseService.buildResponse({ payments }, 'Customers Payments retrieved successfully');
  }

  @Post('/admin/customer/subscriptions/:userId')
  @ApiOperation({
    summary: 'Get Customer Subscriptions',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async getCustomerSubscriptions(
    @Param('userId') userId: string,
  ) {
    const subscriptions = await this.paymentService.getUserSubscriptions(userId);
    return ResponseService.buildResponse({ subscriptions }, 'Customers Subscriptions retrieved successfully');
  }
}
