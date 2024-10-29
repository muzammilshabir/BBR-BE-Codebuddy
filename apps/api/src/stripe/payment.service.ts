import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { UserService } from 'src/users/user.service';
import { ResidenceService } from 'src/residences/residences.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceRepository } from './invoice.repository';
import { Types } from 'mongoose';
import { CreateInvoiceItemsDto, InvoiceItem } from './dto/create-invoice-items.dto';
import { InvoiceItemRepository } from './invoice-item.repository';
import { SubscriptionRepository } from './subscription.repository';
import { ListInvoicesDto } from './dto/list-invoices.dto';
import { DeletionStatus } from 'src/unit/enum/unit-enum';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { RefundRepository } from './refund.repository';
import { InvoiceStatus } from './enum/invoice-status.enum';
import { RefundStatus } from './enum/refund-status.enum';
import { PaymentMethodRepository } from './payment-method.repository';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionRepository } from './transaction.repository';
import { TransactionStatus } from './enum/transaction-status.enum';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { SubscriptionStatus } from './enum/subscription-status.enum';
import { ListRefundRequestsDto } from './dto/list-refund-requests.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly residenceService: ResidenceService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly refundRepository: RefundRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentAttemptRepository: PaymentAttemptRepository
  ) {}

  private convertPaymentItemsToLineItems(
    residenceId: string,
    items: { name: string; price: number; metadata: Record<string, string> }[]
  ): {lineItems: PaymentLineItemDto[], totalPrice: number} {
    const lineItems: PaymentLineItemDto[] = [];
    let totalPrice = 0;
    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.name,
            metadata: {
              residenceId,
              ...item.metadata,
            },
          },
          unit_amount: item.price,
        },
      });
      totalPrice += item.price;
    }

    return { lineItems, totalPrice};
  }

  async createInvoice(userId: string, createInvoiceDto: CreateInvoiceDto, asAdmin: boolean) {
    const transformedDto = {
      ...createInvoiceDto,
      residenceId: new Types.ObjectId(createInvoiceDto.residenceId),
      createdById: new Types.ObjectId(userId),
      developerId: new Types.ObjectId(userId),
    };
    const residence = await this.residenceService.getResidenceById(
      createInvoiceDto.residenceId.toString()
    );
    transformedDto.developerId = residence.developerId;
    if (!asAdmin && residence.developerId != userId) {
      throw new Error('You are not the developer of this residence');
    }
    return this.invoiceRepository.create(transformedDto);
  }

  async updateInvoice(userId: string, invoiceId: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.invoiceRepository.find({
      developerId: userId,
      _id: invoiceId,
    });
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return this.invoiceRepository.update(invoiceId, updateInvoiceDto);
  }

  async updateInvoiceAdmin(invoiceId: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.invoiceRepository.find(invoiceId);
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return this.invoiceRepository.update(invoiceId, updateInvoiceDto);
  }

  async sendInvoiceEmail(invoiceId: string) {
    const invoice = await this.invoiceRepository.find(invoiceId);
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return 'todo';
  }

  async processInvoiceItems(
    items: InvoiceItem[]
  ): Promise<{ name: string; price: number; metadata: Record<string, string> }[]> {
    const parsedItems = [];
    for (const item of items) {
      if (item.custom) {
        parsedItems.push({
          name: item.custom.name,
          price: item.custom.price,
          metadata: {
            type: 'custom',
            id: 0,
          },
        });
      }
      if (item.feature) {
        const feature = await this.subscriptionPlanService.getFeature(item.feature.toString());
        parsedItems.push({
          name: feature.name,
          price: item.feature.price,
          metadata: {
            type: 'feature',
            id: feature._id,
          },
        });
      }
      if (item.plan) {
        const plan = await this.subscriptionPlanService.getPlan(item.plan.toString());
        parsedItems.push({
          name: plan.name,
          price: plan.fee,
          metadata: {
            type: 'plan',
            id: plan._id,
          },
        });
      }
    }
    return parsedItems;
  }

  async createInvoiceItems(
    userId: string,
    createInvoiceItemsDto: CreateInvoiceItemsDto,
    asAdmin: boolean
  ) {
    const invoice = await this.invoiceRepository.findById(
      createInvoiceItemsDto.invoiceId.toString()
    );

    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (!asAdmin && invoice.developerId.toString() != userId) {
      throw new Error('You are not the developer of this residence');
    }

    const data = this.convertPaymentItemsToLineItems(
      invoice.residenceId.toString(),
      await this.processInvoiceItems(createInvoiceItemsDto.invoiceItems)
    );
    const products = await this.stripeService.createProducts(data.lineItems);
    const invoiceItems = [];
    for (const product of products) {
      const invoiceItem = {
        invoiceId: new Types.ObjectId(createInvoiceItemsDto.invoiceId),
        productId: product.id,
        quantity: 1,
        createdById: new Types.ObjectId(userId),
      };
      this.invoiceItemRepository.create(invoiceItem);
      invoiceItems.push(invoiceItem);
    }
    invoice.subTotal += data.totalPrice;
    await this.invoiceRepository.update(invoice.id, {subsTotal: invoice.subTotal});
    return invoiceItems;
  }

  async updateInvoiceItem(
    userId: string,
    invoiceItemId: string,
    updateInvoiceItemDto: UpdateInvoiceItemDto
  ) {
    const invoiceItem = await this.invoiceItemRepository.findOne(invoiceItemId);
    const invoice = await this.invoiceRepository.find({
      developerId: userId,
      _id: invoiceItem.invoiceId,
    });
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    const stripeProduct = await this.stripeService.getProduct(invoiceItem.stripeProductId);
    const stripeProductPrice = await this.stripeService.getPrice(stripeProduct.default_price.toString());
    invoice.subTotal -= stripeProductPrice.unit_amount;
    invoice.subTotal += updateInvoiceItemDto.price;
    await this.invoiceRepository.update(invoice.id, { subTotal: invoice.subTotal });
    return {
      invoiceItem,
      product: this.stripeService.updateProduct(invoiceItem.stripeProductId, updateInvoiceItemDto),
    };
  }

  async updateInvoiceItemAdmin(invoiceItemId: string, updateInvoiceItemDto: UpdateInvoiceItemDto) {
    const invoiceItem = await this.invoiceItemRepository.findOne(invoiceItemId);
    const invoice = await this.invoiceRepository.findOne(invoiceItem.invoiceId.toString());
    if (invoice) {
      throw new Error('Invoice not found');
    }
    const stripeProduct = await this.stripeService.getProduct(invoiceItem.stripeProductId);
    const stripeProductPrice = await this.stripeService.getPrice(stripeProduct.default_price.toString());
    invoice.subTotal -= stripeProductPrice.unit_amount;
    invoice.subTotal += updateInvoiceItemDto.price;
    await this.invoiceRepository.update(invoice.id, { subTotal: invoice.subTotal });
    return {
      invoiceItem,
      product: this.stripeService.updateProduct(invoiceItem.stripeProductId, updateInvoiceItemDto),
    };
  }

  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
    asAdmin: boolean
  ) {
    const transformedDto = {
      ...createSubscriptionDto,
      invoiceId: new Types.ObjectId(createSubscriptionDto.invoiceId),
      createdById: new Types.ObjectId(userId),
    };

    const invoice = await this.invoiceRepository.findById(
      createSubscriptionDto.invoiceId.toString()
    );

    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(
      createSubscriptionDto.invoiceId.toString()
    );
    
    const planItem = invoiceItems.find((item) => item.plan !== null);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (!asAdmin && invoice.developerId.toString() !== userId) {
      throw new Error('You are not the developer of this residence');
    }
    const subscriptions = await this.subscriptionRepository.findByResidenceId(
      transformedDto.residenceId.toString()
    );
    const newSubscription = await this.subscriptionRepository.create(transformedDto);

    if (planItem !== undefined) {
      for (const subscription of subscriptions) {
        await this.subscriptionRepository.update(subscription.id, {
          status: SubscriptionStatus.CANCELED,
        });
      }
      await this.residenceService.upgradeResidence(
        createSubscriptionDto.residenceId.toString(),
        newSubscription.id,
        planItem.plan.toString(),
      );
    }

    return newSubscription;
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    updateSubscriptionDto: UpdateSubscriptionDto
  ) {
    const subscription = await this.subscriptionRepository.findOne(subscriptionId);
    const invoice = await this.invoiceRepository.find({
      developerId: userId,
      _id: subscription.baseInvoiceId,
    });
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return this.subscriptionRepository.update(subscriptionId, updateSubscriptionDto);
  }

  async updateSubscriptionAdmin(
    subscriptionId: string,
    updateSubscriptionDto: UpdateSubscriptionDto
  ) {
    const subscription = await this.subscriptionRepository.findOne(subscriptionId);
    const invoice = await this.invoiceRepository.findOne(subscription.baseInvoiceId.toString());
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return this.subscriptionRepository.update(subscriptionId, updateSubscriptionDto);
  }

  async listCustomers() {
    return this.stripeService.listCustomers();
  }

  async getUserPaymentMethods(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerPaymentMethods(customerId);
  }

  async getSellerPaymentMethods(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const paymentMethods = await this.stripeService.getCustomerPaymentMethods(customerId);
    for(const method of paymentMethods) {
      const residences = await this.residenceService.getResidencesByPaymentMethodId(method.id);
      method['residences'] = residences.map(residence => ({
        id: residence.id,
        name: residence.name,
      }));
    }
    return paymentMethods;
  }

  async createSetupIntent(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return (await this.stripeService.createSetupIntent(customerId)).client_secret;
  }

  async deletePaymentMethod(userId: string, methodId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    await this.paymentMethodRepository.deleteByPaymentMethodId(methodId);
    return this.stripeService.deletePaymentMethod(customerId, methodId);
  }
  async setDefaultResidencePaymentMethod(methodId: string, residenceId: string, userId?: string) {
    if (userId) {
      const residence = await this.residenceService.getResidenceById(residenceId);
      if (!residence || residence.developerId._id != userId) {
        throw new Error('Residence not found');
      }
    }
    return this.residenceService.addDefaultPaymentMethod(residenceId, methodId);
  }

  async unsetDefaultResidencePaymentMethod(residenceId: string, userId?: string) {
    if (userId) {
      const residence = await this.residenceService.getResidenceById(residenceId);
      if (!residence || residence.developerId._id != userId) {
        throw new Error('Residence not found');
      }
    }
    return this.residenceService.removeDefaultPaymentMethod(residenceId);
  }

  async getAllInvoices(listInvoicesDto: ListInvoicesDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if (listInvoicesDto.search) {
      filter.$or = [
        { 'note': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'membershipType': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'residenceId.name': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'developerId.fullName': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'developerId.email': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'paymentMethodId': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'tax': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'status': { $regex: listInvoicesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listInvoicesDto);

    const { data, count } = await this.invoiceRepository.findAll(
      filter,
      options,
      [
        { path: 'residenceId', select: 'name', model: 'Residence' },
        'paymentMethod',
      ],
    );

    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    return { pagination, invoices: data };
  }

  async getUserInvoices(userId: string, listInvoicesDto: ListInvoicesDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      developerId: new Types.ObjectId(userId),
    };

    if (listInvoicesDto.search) {
      filter.$or = [
        { 'note': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'membershipType': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'residenceId.name': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'developerId.fullName': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'developerId.email': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'paymentMethodId': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'tax': { $regex: listInvoicesDto.search, $options: 'i' } },
        { 'status': { $regex: listInvoicesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listInvoicesDto);

    const { data, count } = await this.invoiceRepository.findAll(
      filter,
      options,
      [
        { path: 'residenceId', select: 'name', model: 'Residence' },
        'paymentMethod',
      ],
    );

    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    return { pagination, invoices: data };
  }

  async getUserInvoice(userId: string, invoiceId: string) {
    const invoice = await this.invoiceRepository.find({
      developerId: new Types.ObjectId(userId),
      _id: new Types.ObjectId(invoiceId),
    });
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    for (const item of invoiceItems) {
      const product = await this.stripeService.getProduct(item.stripeProductId);
      item['product'] = product;
    }
    const subscriptions = await this.subscriptionRepository.findByInvoiceId(invoiceId);
    if (invoice.stripeInvoiceId) {
      invoice['stripeInvoice'] = await this.stripeService.getInvoice(invoice.stripeInvoiceId);
    }
    return { invoice, invoiceItems, subscriptions };
  }

  async getUserInvoiceAdmin(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne(invoiceId);
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    for (const item of invoiceItems) {
      const product = await this.stripeService.getProduct(item.stripeProductId);
      item['product'] = product;
    }
    const subscriptions = await this.subscriptionRepository.findByInvoiceId(invoiceId);
    if (invoice.stripeInvoiceId) {
      invoice['stripeInvoice'] = await this.stripeService.getInvoice(invoice.stripeInvoiceId);
    }

    return { invoice, invoiceItems, subscriptions };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    await this.transactionRepository.create(createTransactionDto);
  }

  async getTransactions(userId: string, listTransactionsDto: ListTransactionsDto) {
    const filter: any = {
      developerId: userId,
      isDeleted: DeletionStatus.ACTIVE,
    };

    if (listTransactionsDto.search) {
      filter.$or = [
        { 'id': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'developerId': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'residenceId': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'status': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'amount': { $regex: listTransactionsDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listTransactionsDto);

    const { data, count } = await this.transactionRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listTransactionsDto);

    return { pagination, transactions: data };
  }

  async getTransactionsForResidence(
    residenceId: string,
    listTransactionsDto: ListTransactionsDto,
    userId?: string
  ) {
    const filter: any = {
      residenceId,
      isDeleted: DeletionStatus.ACTIVE,
    };
    if (userId) {
      filter.developerId = userId;
    }
    if (listTransactionsDto.search) {
      filter.$or = [
        { 'id': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'developerId': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'residenceId': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'status': { $regex: listTransactionsDto.search, $options: 'i' } },
        { 'amount': { $regex: listTransactionsDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listTransactionsDto);

    const { data, count } = await this.transactionRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listTransactionsDto);

    return { pagination, transactions: data };
  }

  async getTransaction(transactionId: string, userId?: string) {
    const filter: any = {
      id: transactionId,
    };
    if (userId) {
      filter.developerId = userId;
    }
    return this.transactionRepository.find(filter);
  }

  async getAlerts() {
    return this.paymentAttemptRepository.findAll({ managed: false });
  }

  async manageAlert(alertId: string) {
    return this.paymentAttemptRepository.update(alertId, { managed: true });
  }

  async refundUserInvoice(invoiceId: string, refundPaymentDto: RefundPaymentDto) {
    const transformedDto = {
      ...refundPaymentDto,
      invoiceId,
      attachments: refundPaymentDto.attachments.map((attachment) => new Types.ObjectId(attachment)),
      status: RefundStatus.REFUNDED,
    };
    const invoice = await this.invoiceRepository.findOne(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.status !== InvoiceStatus.PAID) {
      throw new Error('Invoice is not paid');
    }
    await this.stripeService.refundInvoice(invoice.stripeInvoiceId, refundPaymentDto);

    await this.invoiceRepository.update(invoiceId, {
      status: InvoiceStatus.REFUNDED,
    });

    const transaction: CreateTransactionDto = {
      residenceId: invoice.residenceId,
      developerId: invoice.developerId,
      invoiceId: invoice.id,
      amount: refundPaymentDto.amount,
      status: TransactionStatus.REFUNDED,
    };
    await this.createTransaction(transaction);
    return this.refundRepository.create(transformedDto);
  }

  async getRefundRequest(refundId: string) {
    return this.refundRepository.findOneExpanded(refundId);
  }

  async listRefundRequests(listRefundRequestsDto: ListRefundRequestsDto) {
    const filter: any = {
    };

    if (listRefundRequestsDto.search) {
      filter.$or = [
        { 'note': { $regex: listRefundRequestsDto.search, $options: 'i' } },
        { 'status': { $regex: listRefundRequestsDto.search, $options: 'i' } },
        { 'reason': { $regex: listRefundRequestsDto.search, $options: 'i' } },
        { 'amount': { $regex: listRefundRequestsDto.search, $options: 'i' } },
        { 'invoiceId.residenceId.name': { $regex: listRefundRequestsDto.search, $options: 'i' } },
        { 'invoiceId.developerId.fullName': { $regex: listRefundRequestsDto.search, $options: 'i' } },
        { 'invoiceId.note': { $regex: listRefundRequestsDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listRefundRequestsDto);

    const { data, count } = await this.refundRepository.findAll(
      filter,
      options,
      [
        {
          path: 'invoiceId',
          model: 'Invoice',
          populate: [
            { path: 'residenceId', select: 'name', model: 'Residence' },
            { path: 'developerId', select: 'fullName', model: 'User' },
            'paymentMethod',
          ]
        },
      ],
    );

    const { pagination } = PaginationService.paginate({ rows: data, count }, listRefundRequestsDto);

    return { pagination, refundRequests: data };
  }

  async acceptRejectInvoiceRefund(refundId: string, action: RefundStatus) {
    const refund = await this.refundRepository.findOne(refundId);
    if (refund.status !== RefundStatus.REQUESTED) {
      throw new Error('Actions can no longer be performed on this refund request');
    }
    const invoice = await this.invoiceRepository.findOne(refund.invoiceId.toString());
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.status !== InvoiceStatus.PAID) {
      throw new Error('Invoice is not paid');
    }
    if (action == RefundStatus.REFUNDED) {
      const transaction: CreateTransactionDto = {
        residenceId: invoice.residenceId,
        developerId: invoice.developerId,
        invoiceId: invoice.id,
        amount: refund.amount,
        status: TransactionStatus.REFUNDED,
      };
      await this.createTransaction(transaction);
      await this.stripeService.refundInvoice(invoice.stripeInvoiceId, refund);
    }

    await this.invoiceRepository.update(invoice.id, {
      status: action,
    });
    return this.refundRepository.update(refund.id, {
      status: action,
    });
  }

  async requestInvoiceRefund(
    userId: string,
    invoiceId: string,
    refundPaymentDto: RefundPaymentDto
  ) {
    const transformedDto = {
      ...refundPaymentDto,
      invoiceId,
      attachments: refundPaymentDto.attachments.map((attachment) => new Types.ObjectId(attachment)),
      status: RefundStatus.REQUESTED,
    };
    const invoice = await this.invoiceRepository.find({
      id: invoiceId,
      developerId: userId,
    });
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.status !== InvoiceStatus.PAID) {
      throw new Error('Invoice is not paid');
    }
    return this.refundRepository.create(transformedDto);
  }
}
