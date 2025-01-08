import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { CreatePaymentMethodDto } from './dto/create-payment.dto';
import { UserService } from 'src/users/user.service';
import { StripeService } from 'src/stripe/stripe.service';
import {
  GetBuyerPaymentMethodsDto,
  getBuyerPaymentMethodsDtoSchema,
} from './dto/get-buyer-payment-methods.dto';
import { ListInvoicesV2Dto, listInvoicesV2Schema } from './dto/list-invoices-v2.dto';
import { CreateRefundRequestDto, createRefundRequestSchema } from './dto/create-refund-request.dto';
import { ListRefundRequestsDto, listRefundRequestsSchema } from './dto/list-refund-requests.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly stripeService: StripeService
  ) {}
  @Get('/invoices/')
  @ApiOperation({
    summary: 'Get Customer Invoices',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(listInvoicesSchema, 'query'))
  async getCustomerInvoices(@GetCurrentUserId() userId: string, @Query() query: ListInvoicesDto) {
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
    @Param('invoiceId') invoiceId: string
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
    @Body() createInvoiceDto: CreateInvoiceDto
  ) {
    const invoice = await this.paymentService.createInvoice(userId, createInvoiceDto, false);
    return ResponseService.buildResponse({ invoice }, 'Invoice created successfully');
  }

  @Post('/invoice/:id/manual-payment')
  @ApiOperation({
    summary: 'Generate Payment Intent for Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async manuallyPayInvoice(@GetCurrentUserId() userId: string, @Param('id') invoiceId: string) {
    const intent = await this.paymentService.createManualPaymentForInvoice(invoiceId, userId);
    return ResponseService.buildResponse({ intent }, 'Invoice Payment Intent created successfully');
  }

  @Get('/refund/:id/receipt')
  @ApiOperation({
    summary: 'Generate Refund Receipt',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async generateRefundReceipt(@GetCurrentUserId() userId: string, @Param('id') refundId: string) {
    const receiptUrl = await this.paymentService.generateRefundReceipt(refundId, userId);
    return ResponseService.buildResponse({ receiptUrl }, 'Refund receipt generated successfully');
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
    @Body() updateInvoiceDto: UpdateInvoiceDto
  ) {
    const invoice = await this.paymentService.updateInvoice(userId, id, updateInvoiceDto);
    return ResponseService.buildResponse({ invoice }, 'Invoice updated successfully');
  }

  @Post('/invoice-items')
  @ApiOperation({
    summary: 'Create Invoice Items',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createInvoiceItemsDtoSchema, 'body'))
  async createInvoiceItems(
    @GetCurrentUserId() userId: string,
    @Body() createInvoiceItemsDto: CreateInvoiceItemsDto
  ) {
    const invoiceItems = await this.paymentService.createInvoiceItems(
      userId,
      createInvoiceItemsDto,
      false
    );
    return ResponseService.buildResponse({ invoiceItems }, 'Invoice Items created successfully');
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
    @Body() updateInvoiceItemDto: UpdateInvoiceItemDto
  ) {
    const invoiceItem = await this.paymentService.updateInvoiceItem(
      userId,
      id,
      updateInvoiceItemDto
    );
    return ResponseService.buildResponse({ invoiceItem }, 'Invoice Item updated successfully');
  }

  @Post('/invoice-subscription')
  @ApiOperation({
    summary: 'Create Invoice Subscription',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createSubscriptionDtoSchema, 'body'))
  async createInvoiceSubscription(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto
  ) {
    const subscription = await this.paymentService.createSubscription(
      userId,
      createSubscriptionDto,
      false
    );
    return ResponseService.buildResponse(
      { subscription },
      'Invoice Subscription created successfully'
    );
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
    @Body() updateSubscriptionDto: UpdateSubscriptionDto
  ) {
    const subscription = await this.paymentService.updateSubscription(
      userId,
      id,
      updateSubscriptionDto
    );
    return ResponseService.buildResponse(
      { subscription },
      'Invoice Subscription updated successfully'
    );
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
    @Body() refundPaymentDto: RefundPaymentDto
  ) {
    const refund = await this.paymentService.requestInvoiceRefund(
      userId,
      invoiceId,
      refundPaymentDto
    );
    return ResponseService.buildResponse({ refund }, 'Refund request created successfully');
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
    @Query() listTransactionsDto: ListTransactionsDto
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
    @Query() listTransactionsDto: ListTransactionsDto
  ) {
    const paymentMethods = await this.paymentService.getTransactionsForResidence(
      residenceId,
      listTransactionsDto,
      userId
    );
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
    @Param('transactionId') transactionId: string
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
  async getPaymentMethods(@GetCurrentUserId() userId: string) {
    const paymentMethods = await this.paymentService.getSellerPaymentMethods(userId);
    return ResponseService.buildResponse(
      { paymentMethods },
      'Payment Methods retrieved successfully'
    );
  }

  @Post('/payment-method')
  @ApiOperation({
    summary: 'Create Payment Method Setup Intent',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async createSetupIntent(
    @GetCurrentUserId() userId: string,
    @Body('paymentMethodId') paymentMethodId: string,
    @Ip() ip,
    @Headers('user-agent') userAgent
  ) {
    const intent = await this.paymentService.createSetupIntent(
      userId,
      paymentMethodId,
      ip,
      userAgent
    );
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
    @Param('methodId') methodId: string
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
    @Param('residenceId') residenceId: string
  ) {
    const residence = await this.paymentService.setDefaultResidencePaymentMethod(
      methodId,
      residenceId,
      userId
    );
    return ResponseService.buildResponse(
      { residence },
      'Default Residence Payment Method set successfully'
    );
  }

  @Patch('/payment-method-default-unset/:residenceId')
  @ApiOperation({
    summary: 'Unset default payment method for residence',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async unsetDefaultResidencePaymentMethod(
    @GetCurrentUserId() userId: string,
    @Param('residenceId') residenceId: string
  ) {
    const residence = await this.paymentService.unsetDefaultResidencePaymentMethod(
      residenceId,
      userId
    );
    return ResponseService.buildResponse(
      { residence },
      'Default Residence Payment Method unset successfully'
    );
  }

  @Post('/payment-method-v2')
  @ApiOperation({
    summary: 'Create Payment Method for Customer',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async createCustomerPaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    const paymentMethod = await this.paymentService.createCustomerPaymentMethod(
      createPaymentMethodDto.developerId,
      createPaymentMethodDto
    );
    return ResponseService.buildResponse({ paymentMethod }, 'Payment Method created successfully');
  }

  @Get('/payment-methods-v2/:buyerId')
  @ApiOperation({
    summary: 'Get Payment Methods for Buyer',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getBuyerPaymentMethodsDtoSchema, 'param'))
  async getBuyerPaymentMethods(@Param() params: GetBuyerPaymentMethodsDto) {
    const paymentMethods = await this.paymentService.getBuyerPaymentMethods(params.buyerId);
    return ResponseService.buildResponse(
      { paymentMethods: paymentMethods.data },
      'Buyer Payment Methods retrieved successfully'
    );
  }

  @Get('/invoices/v2')
  @ApiOperation({
    summary: 'Get Invoices V2',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listInvoicesV2Schema, 'query'))
  async getInvoicesV2(@Query() query: ListInvoicesV2Dto) {
    const invoices = await this.paymentService.getInvoicesV2(query);
    return ResponseService.buildResponse(invoices, 'Invoices retrieved successfully');
  }

  @Get('/refund-reasons')
  @ApiOperation({
    summary: 'Get All Refund Request Reasons',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async getRefundReasons() {
    const reasons = await this.paymentService.getRefundReasons();
    return ResponseService.buildResponse({ reasons }, 'Refund reasons retrieved successfully');
  }

  @Post('/refund-requests')
  @ApiOperation({
    summary: 'Create refund request for an invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createRefundRequestSchema, 'body'))
  async createRefundRequest(
    @GetCurrentUserId() userId: string,
    @Body() createRefundRequestDto: CreateRefundRequestDto
  ) {
    const refundRequest = await this.paymentService.createRefundRequest(
      userId,
      createRefundRequestDto
    );
    return ResponseService.buildResponse({ refundRequest }, 'Refund request created successfully');
  }

  @Get('/refund-requests')
  @ApiOperation({
    summary: 'Get Refund Requests',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(listRefundRequestsSchema, 'query'))
  async getRefundRequests(@Query() query: ListRefundRequestsDto) {
    const refundRequests = await this.paymentService.getRefundRequests(query);
    return ResponseService.buildResponse(refundRequests, 'Refund requests retrieved successfully');
  }

  @Post('/refund-requests/:id/reject')
  @ApiOperation({
    summary: 'Reject a refund request',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async rejectRefundRequest(@Param('id') refundRequestId: string) {
    const refundRequest = await this.paymentService.rejectRefundRequest(refundRequestId);
    return ResponseService.buildResponse({ refundRequest }, 'Refund request rejected successfully');
  }

  @Post('/refund-requests/:id/approve')
  @ApiOperation({
    summary: 'Approve a refund request and process the refund',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async approveRefundRequest(@Param('id') refundRequestId: string) {
    const refundRequest = await this.paymentService.approveRefundRequest(refundRequestId);
    return ResponseService.buildResponse({ refundRequest }, 'Refund request approved successfully');
  }

  @Get('/refund-requests/:id')
  @ApiOperation({
    summary: 'Get Single Refund Request with Relations',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async getRefundRequest(@Param('id') refundRequestId: string) {
    const refundRequest = await this.paymentService.getRefundRequestV2(refundRequestId);
    return ResponseService.buildResponse(
      { refundRequest },
      'Refund request retrieved successfully'
    );
  }

  @Get('/residence-payments')
  @ApiOperation({
    summary: 'Get Residence Payments with Active Invoice Schedules',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async getResidencePayments(@GetCurrentUserId() userId: string) {
    const residences = await this.paymentService.getResidencePayments(userId);
    return ResponseService.buildResponse(
      { residences },
      'Residence payments retrieved successfully'
    );
  }

  @Post('/invoice/:id/mark-paid')
  @ApiOperation({
    summary: 'Mark Invoice as Paid Manually and Forgive Stripe Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async markInvoicePaidManually(@Param('id') invoiceId: string) {
    const invoice = await this.paymentService.markInvoiceAsPaidManually(invoiceId);
    return ResponseService.buildResponse({ invoice }, 'Invoice marked as paid successfully');
  }

  @Post('/invoice/:id/cancel')
  @ApiOperation({
    summary: 'Cancel Invoice and Void Stripe Invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async cancelInvoice(@Param('id') invoiceId: string) {
    const invoice = await this.paymentService.cancelInvoice(invoiceId);
    return ResponseService.buildResponse({ invoice }, 'Invoice cancelled successfully');
  }

  @Post('/invoice/:id/send')
  @ApiOperation({
    summary: 'Send Invoice Email',
    description: 'Send email for pending or draft invoice',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  async sendInvoiceEmail(@Param('id') invoiceId: string) {
    const invoice = await this.paymentService.sendInvoiceEmailV2(invoiceId);
    return ResponseService.buildResponse({ invoice }, 'Invoice email sent successfully');
  }
}
