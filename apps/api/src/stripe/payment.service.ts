import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { RefundRepository } from './refund.repository';
import { InvoiceStatus } from './enum/invoice-status.enum';
import { RefundRequestStatus, RefundStatus } from './enum/refund-status.enum';
import { PaymentMethodRepository } from './payment-method.repository';
import { SubscriptionPlanService } from 'src/subscription-plan/subscription-plan.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionRepository } from './transaction.repository';
import { TransactionStatus } from './enum/transaction-status.enum';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { PaymentAttemptRepository } from './payment-attempt.repository';
import { SubscriptionStatus } from './enum/subscription-status.enum';
import { ListRefundRequestsDto } from './dto/list-refund-requests.dto';
import { PaymentAttemptStatus } from './enum/payment-attempt-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailEvent } from 'src/mailer/events/send-email.event';
import { Invoice } from './schema/invoice.schema';
import { PdfService } from 'src/pdf/pdf.service';
import { UploadService } from 'src/upload/upload.service';
import { CreatePaymentMethodDto } from './dto/create-payment.dto';
import { ListInvoicesV2Dto } from './dto/list-invoices-v2.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefundRequestReason } from './schema/refund-request-reason.schema';
import { RefundRequest } from './schema/refund-request.schema';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { Residence } from 'src/residences/schema/residences.schema';
import {
  InvoiceScheduleStatus,
  PaymentMethodType,
} from 'src/invoice-schedule/invoiceSchedule.enum';

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
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly eventEmitter: EventEmitter2,
    private pdfService: PdfService,
    private uploadService: UploadService,
    @InjectModel(RefundRequestReason.name)
    private readonly refundRequestReasonModel: Model<RefundRequestReason>,
    @InjectModel(RefundRequest.name)
    private readonly refundRequestModel: Model<RefundRequest>,

    @InjectModel(Residence.name)
    private readonly residenceModel: Model<Residence>,

    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice>
  ) {}

  private convertPaymentItemsToLineItems(
    residenceId: string,
    items: { name: string; price: number; metadata: Record<string, string> }[]
  ): { lineItems: PaymentLineItemDto[]; totalPrice: number } {
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

    return { lineItems, totalPrice };
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
    transformedDto.developerId = residence.developerId._id;
    if (!asAdmin && residence.developerId._id != userId) {
      throw new Error('You are not the developer of this residence');
    }
    return this.invoiceRepository.create(transformedDto);
  }

  async createManualPaymentForInvoice(
    invoiceId: string,
    userId?: string
  ): Promise<{
    invoice: Invoice;
    stripeInvoice: {
      id: string;
      total: number;
      customer: string;
      customer_email: string;
      items: { description: string; amount: number; currency: string; type: string }[];
    };
  }> {
    const invoice = userId
      ? await this.invoiceRepository.find({ _id: invoiceId, developerId: userId })
      : await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.PENDING) {
      throw new Error('Invoice is not in pending status');
    }

    const developer = await this.userService.findById(invoice.developerId.toString());
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoice.id.toString());
    const invoiceSubscription = await this.subscriptionRepository.findByInvoiceId(
      invoice.id.toString()
    );
    const paymentAttempts = await this.paymentAttemptRepository.findByInvoiceId(
      invoice.id.toString()
    );
    const totalAttemptsMade = paymentAttempts.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attemptsToday = paymentAttempts.filter(
      (attempt) => new Date(attempt.createdAt) >= today
    ).length;

    let maxTotalAttempts = 3;
    let maxAttemptsPerDay = 1;

    if (invoiceSubscription) {
      maxTotalAttempts = invoiceSubscription.renewalAttempts;
      maxAttemptsPerDay = invoiceSubscription.attemptsFrequency;
    }

    try {
      const productIds = invoiceItems.map((item) => item.stripeProductId.toString());

      const stripeInvoice = await this.stripeService.createManualInvoice(
        developer.stripeCustomerId,
        productIds,
        invoice.discount,
        invoice.tax
      );

      await this.paymentAttemptRepository.create({
        invoiceId: invoice._id,
        paymentMethodId: invoice.paymentMethodId,
        stripeInvoiceId: stripeInvoice.id,
        status: PaymentAttemptStatus.PENDING,
        attemptNumber: totalAttemptsMade + 1,
        attemptsRemaining: maxTotalAttempts - (totalAttemptsMade + 1),
        attemptsRemainingToday: maxAttemptsPerDay - (attemptsToday + 1),
        createdAt: new Date(),
      });

      return { ...invoice.toObject(), stripeInvoice };
    } catch (error) {
      throw new Error(`Unable to create payment intent: ${error.message}`);
    }
  }

  async updateInvoice(userId: string, invoiceId: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.invoiceRepository.find({
      developerId: userId,
      _id: invoiceId,
    });
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return this.invoiceRepository.update(invoiceId, updateInvoiceDto);
  }

  async generateRefundReceipt(refundId: string, userId?: string): Promise<string> {
    const refund = userId
      ? await this.refundRepository.findExpanded({ _id: refundId, developerId: userId })
      : await this.refundRepository.findOneExpanded(refundId);

    if (!refund) {
      throw new Error('Refund not found');
    }
    if (refund.receiptUrl) {
      return refund.receiptUrl;
    }

    if (refund.status !== RefundRequestStatus.REFUNDED) {
      throw new Error('Refund has not been processed');
    }

    const pdfBuffer = await this.pdfService.generateRefundReceipt(refund);
    const fileName = `refund-receipt-${refundId}.pdf`;

    const { url } = await this.uploadService.uploadPdfToS3(
      pdfBuffer,
      fileName,
      (refund.invoiceId as any).developerId._id.toString()
    );

    refund.receiptUrl = url;
    await refund.save();

    return refund.receiptUrl;
  }

  async updateInvoiceAdmin(invoiceId: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return this.invoiceRepository.update(invoiceId, updateInvoiceDto);
  }

  private async sendInvoiceEmailEvent(
    email: string,
    customerName: string,
    data: {
      date: Date;
      items: {
        name: string;
        quantity: number;
        price: number;
      }[];
      subTotal: number;
      tax: number;
      taxAmount: number;
      discount: number;
      total: number;
    }
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          customerName,
          ...data,
        },
        template: 'invoice',
        subject: `Invoice ${data.date}`,
        toEmail: email,
      })
    );
  }

  async markInvoiceAsPaid(invoiceId: string) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    const stripeInvoice = invoice.stripeInvoiceId
      ? await this.stripeService.getInvoiceFull(invoice.stripeInvoiceId)
      : (await this.createManualPaymentForInvoice(invoice.id.toString())).stripeInvoice;

    invoice.stripeInvoiceId = stripeInvoice.id;

    await this.stripeService.markInvoiceAsPaid(invoice.stripeInvoiceId, {
      paid_out_of_band: true,
      payment_method: 'external',
    });

    invoice.status = InvoiceStatus.PAID;
    const paymentAttempt = await this.paymentAttemptRepository.find({
      invoiceId: invoice._id,
    });
    await this.paymentAttemptRepository.update(paymentAttempt.id, {
      status: PaymentAttemptStatus.SUCCEEDED,
    });
    const updatedInvoice = await this.invoiceRepository.update(invoiceId, invoice);

    const transaction: CreateTransactionDto = {
      residenceId: updatedInvoice.residenceId,
      developerId: updatedInvoice.developerId,
      invoiceId: updatedInvoice.id,
      amount: stripeInvoice.total,
      status: TransactionStatus.PAID,
    };

    await this.transactionRepository.create(transaction);
  }

  async sendInvoiceEmail(invoiceId: string) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    const developer = await this.userService.findById(invoice.developerId.toString());

    const items = [];
    for (const item of invoiceItems) {
      const stripeProduct = await this.stripeService.getProduct(item.stripeProductId.toString());
      const stripeProductPrice = await this.stripeService.getPrice(
        stripeProduct.default_price.toString()
      );
      items.push({
        name: stripeProduct.name,
        quantity: item.quantity,
        price: stripeProductPrice.unit_amount,
      });
    }

    const subtotalAfterDiscount = invoice.subTotal - invoice.discount;
    const taxAmount = subtotalAfterDiscount * (invoice.tax / 100);
    const total = subtotalAfterDiscount + taxAmount;

    const data = {
      date: invoice.createdAt,
      items: items,
      subTotal: invoice.subTotal,
      discount: invoice.discount,
      tax: invoice.tax,
      taxAmount: taxAmount,
      total: total,
    };

    await this.sendInvoiceEmailEvent(developer.email, developer.fullName, data);

    return 'Invoice email sent successfully';
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
        const feature = await this.subscriptionPlanService.getFeature(item.feature.id.toString());
        if (!feature) {
          throw new Error('Feature not found');
        }
        parsedItems.push({
          name: feature.name,
          price: item.feature.price,
          metadata: {
            type: 'feature',
            id: feature._id.toString(),
          },
        });
      }
      if (item.plan) {
        const plan = await this.subscriptionPlanService.getPlan(item.plan.toString());
        if (!plan) {
          throw new Error('Plan not found');
        }
        parsedItems.push({
          name: plan.name,
          price: plan.fee,
          metadata: {
            type: 'plan',
            id: plan._id.toString(),
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
      const invoiceItemData = {
        invoiceId: new Types.ObjectId(createInvoiceItemsDto.invoiceId),
        productId: product.id,
        quantity: 1,
        createdById: new Types.ObjectId(userId),
      };
      const invoiceItem = await this.invoiceItemRepository.create(invoiceItemData);
      invoiceItems.push({
        ...invoiceItem.toObject(),
        name: product.name,
        unit_amount: (product as any).unit_amount,
        type: (product as any).type,
      });
    }
    invoice.subTotal += data.totalPrice;
    await this.invoiceRepository.update(invoice.id, { subsTotal: invoice.subTotal });
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
    const stripeProductPrice = await this.stripeService.getPrice(
      stripeProduct.default_price.toString()
    );
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
    const stripeProductPrice = await this.stripeService.getPrice(
      stripeProduct.default_price.toString()
    );
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
      baseInvoiceId: new Types.ObjectId(createSubscriptionDto.invoiceId),
      createdById: new Types.ObjectId(userId),
    };

    const invoice = await this.invoiceRepository.find({
      _id: createSubscriptionDto.invoiceId.toString(),
      residenceId: new Types.ObjectId(createSubscriptionDto.residenceId),
    });

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
    try {
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
          planItem.plan.toString()
        );
      }

      return newSubscription;
    } catch (err) {
      return err;
    }
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
    if (!invoice) {
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
    if (!invoice) {
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
    for (const method of paymentMethods) {
      const residences = await this.residenceService.getResidencesByPaymentMethodId(method.id);
      method['residences'] = residences.map((residence) => ({
        id: residence.id,
        name: residence.name,
      }));
    }
    return paymentMethods;
  }

  async createSetupIntent(userId: string, paymentMethodId: string, ip: string, userAgent: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const intent = await this.stripeService.createSetupIntent(
      customerId,
      paymentMethodId,
      ip,
      userAgent
    );
    return { id: intent.id, client_secret: intent?.client_secret };
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
    const { status, search } = listInvoicesDto;
    const matchStage: any = {
      isDeleted: false,
    };

    if (status) {
      matchStage.status = status;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      {
        $unwind: {
          path: '$residence',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developer',
        },
      },
      {
        $unwind: {
          path: '$developer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { note: { $regex: search, $options: 'i' } },
            { membershipType: { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
            { 'developer.fullName': { $regex: search, $options: 'i' } },
            { 'developer.email': { $regex: search, $options: 'i' } },
            { paymentMethodId: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $skip: (listInvoicesDto.page - 1) * listInvoicesDto.limit },
      { $limit: listInvoicesDto.limit },
    ];

    const [countResult, data] = await Promise.all([
      this.invoiceRepository.aggregate(countPipeline),
      this.invoiceRepository.aggregate(dataPipeline),
    ]);

    const count = countResult[0]?.total || 0;
    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    const records = await Promise.all(
      data.map(async (invoice) => {
        const record = { ...invoice };
        if (invoice.stripeInvoiceId) {
          try {
            record.stripeInvoice = await this.stripeService.getInvoice(invoice.stripeInvoiceId);
          } catch (error) {
            record.stripeInvoice = { web: null, pdf: null };
          }
        } else {
          record.stripeInvoice = { web: null, pdf: null };
        }
        if (invoice.paymentMethodId && invoice.developer?.stripeCustomerId) {
          try {
            record.stripePaymentMethod = await this.stripeService.retrieveCustomerPaymentMethod(
              invoice.developer.stripeCustomerId,
              invoice.paymentMethodId
            );
          } catch (error) {
            record.stripePaymentMethod = { id: null, type: null };
          }
        } else {
          record.stripePaymentMethod = { id: null, type: null };
        }
        return record;
      })
    );

    return { pagination, invoices: records };
  }

  async getUserInvoices(userId: string, listInvoicesDto: ListInvoicesDto) {
    const { status, search } = listInvoicesDto;
    const matchStage: any = {
      isDeleted: false,
      developerId: new Types.ObjectId(userId),
    };

    if (status) {
      matchStage.status = status;
    }

    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      {
        $unwind: {
          path: '$residence',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developer',
        },
      },
      {
        $unwind: {
          path: '$developer',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { note: { $regex: search, $options: 'i' } },
            { membershipType: { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
            { 'developer.fullName': { $regex: search, $options: 'i' } },
            { 'developer.email': { $regex: search, $options: 'i' } },
            { paymentMethodId: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $skip: (listInvoicesDto.page - 1) * listInvoicesDto.limit },
      { $limit: listInvoicesDto.limit },
    ];

    const [countResult, data] = await Promise.all([
      this.invoiceRepository.aggregate(countPipeline),
      this.invoiceRepository.aggregate(dataPipeline),
    ]);

    const count = countResult[0]?.total || 0;
    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    const records = await Promise.all(
      data.map(async (invoice) => {
        const record = { ...invoice };
        if (invoice.stripeInvoiceId) {
          try {
            record.stripeInvoice = await this.stripeService.getInvoice(invoice.stripeInvoiceId);
          } catch (error) {
            record.stripeInvoice = { web: null, pdf: null };
          }
        } else {
          record.stripeInvoice = { web: null, pdf: null };
        }
        if (invoice.paymentMethodId && invoice.developer?.stripeCustomerId) {
          try {
            record.stripePaymentMethod = await this.stripeService.retrieveCustomerPaymentMethod(
              invoice.developer.stripeCustomerId,
              invoice.paymentMethodId
            );
          } catch (error) {
            record.stripePaymentMethod = { id: null, type: null };
          }
        } else {
          record.stripePaymentMethod = { id: null, type: null };
        }
        return record;
      })
    );

    return { pagination, invoices: records };
  }

  async getUserInvoice(userId: string, invoiceId: string) {
    const invoice = await this.invoiceRepository.find({
      developerId: new Types.ObjectId(userId),
      _id: new Types.ObjectId(invoiceId),
    });
    const developer = await this.userService.findById(userId);
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    for (const item of invoiceItems) {
      const product = await this.stripeService.getProduct(item.stripeProductId);
      item['product'] = product;
    }
    const subscriptions = await this.subscriptionRepository.findByInvoiceId(invoiceId);

    const result: any = { invoice, invoiceItems, subscriptions };

    if (invoice.stripeInvoiceId) {
      result.stripeInvoice = await this.stripeService.getInvoice(invoice.stripeInvoiceId);
    } else {
      result.stripeInvoice = { web: null, pdf: null };
    }
    if (invoice.paymentMethodId && developer.stripeCustomerId) {
      result.stripePaymentMethod = (await this.stripeService.retrieveCustomerPaymentMethod(
        developer.stripeCustomerId,
        invoice.paymentMethodId
      )) || { id: null, type: null };
    }
    return result;
  }

  async getUserInvoiceAdmin(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne(invoiceId);
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    for (const item of invoiceItems) {
      const product = await this.stripeService.getProduct(item.stripeProductId);
      item['product'] = product;
    }
    const developer = await this.userService.findById(invoice.developerId.toString());
    const subscriptions = await this.subscriptionRepository.findByInvoiceId(invoiceId);
    const residence = await this.residenceService.getResidenceById(invoice.residenceId.toString());

    const result: any = {
      invoice,
      invoiceItems,
      subscriptions,
      developer: developer.fullName,
      email: developer.email,
      companyName: developer.companyName,
      residenceName: residence.name,
    };

    if (invoice.stripeInvoiceId) {
      result.stripeInvoice = await this.stripeService.getInvoice(invoice.stripeInvoiceId);
    } else {
      result.stripeInvoice = { web: null, pdf: null };
    }
    if (invoice.paymentMethodId && developer.stripeCustomerId) {
      result.stripePaymentMethod = (await this.stripeService.retrieveCustomerPaymentMethod(
        developer.stripeCustomerId,
        invoice.paymentMethodId
      )) || { id: null, type: null };
    }
    return result;
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    await this.transactionRepository.create(createTransactionDto);
  }

  async getTransactions(userId: string, listTransactionsDto: ListTransactionsDto) {
    const filter: any = {
      developerId: new Types.ObjectId(userId),
      isDeleted: false,
    };

    if (listTransactionsDto.search) {
      filter.$or = [{ status: { $regex: listTransactionsDto.search, $options: 'i' } }];

      if (Types.ObjectId.isValid(listTransactionsDto.search)) {
        filter.$or.push(
          { _id: new Types.ObjectId(listTransactionsDto.search) },
          { developerId: new Types.ObjectId(listTransactionsDto.search) },
          { residenceId: new Types.ObjectId(listTransactionsDto.search) }
        );
      }
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
      isDeleted: false,
    };
    if (userId) {
      filter.developerId = new Types.ObjectId(userId);
    }

    if (listTransactionsDto.search) {
      filter.$or = [{ status: { $regex: listTransactionsDto.search, $options: 'i' } }];

      if (Types.ObjectId.isValid(listTransactionsDto.search)) {
        filter.$or.push(
          { _id: new Types.ObjectId(listTransactionsDto.search) },
          { developerId: new Types.ObjectId(listTransactionsDto.search) }
        );
      }
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
    return this.paymentAttemptRepository.findAll({ managed: false }, null, [{ path: 'invoiceId' }]);
  }

  async manageAlert(alertId: string) {
    return this.paymentAttemptRepository.update(alertId, { managed: true });
  }

  async refundUserInvoice(invoiceId: string, refundPaymentDto: RefundPaymentDto) {
    const transformedDto = {
      ...refundPaymentDto,
      invoiceId,
      attachments: refundPaymentDto.attachments.map((attachment) => new Types.ObjectId(attachment)),
      status: RefundRequestStatus.REFUNDED,
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
      invoiceId: new Types.ObjectId(invoice.id),
      amount: refundPaymentDto.amount,
      status: TransactionStatus.REFUNDED,
    };
    await this.createTransaction(transaction);
    return this.refundRepository.create(transformedDto);
  }

  async getRefundRequest(refundId: string) {
    const refund = await this.refundRepository.findOneExpanded(refundId);
    const stripePaymentMethod = await this.stripeService.retrieveCustomerPaymentMethod(
      (refund.invoiceId as any).developerId.stripeCustomerId,
      (refund.invoiceId as any).paymentMethodId
    );

    return {
      ...refund.toObject(),
      stripePaymentMethod,
      email: (refund.invoiceId as any).developerId.email,
    };
  }

  async listRefundRequests(listRefundRequestsDto: ListRefundRequestsDto) {
    const { status, search } = listRefundRequestsDto;
    const matchStage: any = {};

    if (status) {
      matchStage.status = status;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice',
        },
      },
      {
        $unwind: {
          path: '$invoice',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'invoice.residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      {
        $unwind: {
          path: '$residence',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'invoice.developerId',
          foreignField: '_id',
          as: 'developer',
        },
      },
      {
        $unwind: {
          path: '$developer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { note: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { reason: { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
            { 'developer.fullName': { $regex: search, $options: 'i' } },
            { 'invoice.note': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $skip: (listRefundRequestsDto.page - 1) * listRefundRequestsDto.limit },
      { $limit: listRefundRequestsDto.limit },
    ];
    const [countResult, data] = await Promise.all([
      this.refundRepository.aggregate(countPipeline),
      this.refundRepository.aggregate(dataPipeline),
    ]);

    const count = countResult[0]?.total || 0;
    const { pagination } = PaginationService.paginate({ rows: data, count }, listRefundRequestsDto);

    const refundRequests = await Promise.all(
      data.map(async (refund) => {
        return {
          ...refund,
          invoiceNumber: refund.invoice?.invoiceNumber,
          residenceDetails: refund.residence,
          developerDetails: refund.developer,
          receiptUrl: refund.invoice?.receiptUrl,
          attachmentName: refund.invoice?.attachmentName,
          attachmentUrl: refund.invoice?.attachmentUrl,
        };
      })
    );

    return { pagination, refundRequests };
  }

  async acceptRejectInvoiceRefund(refundId: string, action: RefundRequestStatus) {
    const refund = await this.refundRepository.findOne(refundId);
    if (refund.status !== RefundRequestStatus.REQUESTED) {
      throw new Error('Actions can no longer be performed on this refund request');
    }
    const invoice = await this.invoiceRepository.findOne(refund.invoiceId.toString());
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.status !== InvoiceStatus.PAID) {
      throw new Error('Invoice is not paid');
    }
    if (action == RefundRequestStatus.REFUNDED) {
      const transaction: CreateTransactionDto = {
        residenceId: invoice.residenceId,
        developerId: invoice.developerId,
        invoiceId: invoice.id,
        amount: refund.amount,
        status: TransactionStatus.REFUNDED,
      };
      await this.createTransaction(transaction);
      await this.stripeService.refundInvoice(invoice.stripeInvoiceId, refund);

      await this.invoiceRepository.update(invoice.id, {
        status: action,
      });
    }

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
      status: RefundRequestStatus.REQUESTED,
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

  async createCustomerPaymentMethod(
    userId: string,
    createPaymentMethodDto: CreatePaymentMethodDto
  ) {
    const user = await this.userService.findById(userId);
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer({
        email: user.email,
        name: user.fullName,
      });
      stripeCustomerId = customer.id;
      await this.userService.updateSellerStripeCustomerId(userId, stripeCustomerId);
    }

    const stripePaymentMethod = await this.stripeService.createPaymentMethod(
      stripeCustomerId,
      createPaymentMethodDto.pmTokenId
    );

    // Save payment method details to database
    const paymentMethodData = {
      customerId: new Types.ObjectId(userId),
      paymentMethodId: stripePaymentMethod.id,
      last4Digit: stripePaymentMethod.card.last4,
      brand: stripePaymentMethod.card.brand,
      expiryMonth:
        stripePaymentMethod.card.exp_month < 10
          ? `0${stripePaymentMethod.card.exp_month}`
          : `${stripePaymentMethod.card.exp_month}`,
      expiryYear: stripePaymentMethod.card.exp_year,
    };

    await this.paymentMethodRepository.create(paymentMethodData);

    return stripePaymentMethod;
  }

  async getBuyerPaymentMethods(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.stripeCustomerId) {
      throw new Error('User not found or has no payment methods');
    }

    return this.paymentMethodRepository.findAll({ customerId: user.id });
  }

  async getInvoicesV2(listInvoicesDto: ListInvoicesV2Dto) {
    const { status, search, residenceId, developerId, paymentMethodType } = listInvoicesDto;
    const matchStage: any = {
      isDeleted: false,
    };

    if (status) {
      matchStage.status = status;
    } else {
      matchStage.status = {
        $in: [
          InvoiceStatus.DRAFT,
          InvoiceStatus.PENDING,
          InvoiceStatus.PAID,
          InvoiceStatus.CANCELED,
          InvoiceStatus.FAILED,
          InvoiceStatus.REFUNDED,
        ],
      };
    }

    if (residenceId) {
      matchStage.residenceId = new Types.ObjectId(residenceId);
    }

    if (developerId) {
      matchStage.developerId = new Types.ObjectId(developerId);
    }

    if (paymentMethodType) {
      matchStage.paymentMethodType = paymentMethodType;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'residences',
          localField: 'residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      {
        $unwind: {
          path: '$residence',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
    ] as any;

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { note: { $regex: search, $options: 'i' } },
            { membershipType: { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
            { paymentMethodId: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
    pipeline.push({
      $project: {
        id: '$_id',
        issuedAt: 1,
        invoiceNumber: 1,
        dueAt: 1,
        residenceId: 1,
        residenceName: '$residence.name',
        notes: 1,
        total: 1,
        hostedInvoiceUrl: 1,
        pdfLink: 1,
        status: 1,
        paymentMethodType: 1,
        invoiceScheduleId: 1,
      },
    });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $skip: (listInvoicesDto.page - 1) * listInvoicesDto.limit },
      { $limit: listInvoicesDto.limit },
    ];

    const [countResult, data] = await Promise.all([
      this.invoiceRepository.aggregate(countPipeline),
      this.invoiceRepository.aggregate(dataPipeline),
    ]);

    const count = countResult[0]?.total || 0;
    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    return { pagination, invoices: data };
  }

  async getRefundReasons(): Promise<RefundRequestReason[]> {
    return this.refundRequestReasonModel.find({ isDeleted: false });
  }

  async createRefundRequest(userId: string, createRefundRequestDto: CreateRefundRequestDto) {
    // Get invoice and validate it's paid
    const invoice = await this.invoiceRepository.findById(createRefundRequestDto.invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status !== 'paid') {
      throw new BadRequestException('Invoice must be paid to request a refund');
    }

    // Validate refund amount
    if (createRefundRequestDto.amount > invoice.total) {
      throw new BadRequestException('Refund amount cannot exceed invoice total');
    }

    // Validate refund reason exists
    const reason = await this.refundRequestReasonModel.findById(createRefundRequestDto.reasonId);
    if (!reason) {
      throw new NotFoundException('Refund reason not found');
    }

    // Check if there is already a pending refund request
    const existingRefundRequest = await this.refundRequestModel.findOne({
      invoiceId: new Types.ObjectId(createRefundRequestDto.invoiceId),
      status: RefundRequestStatus.REQUESTED,
    });
    if (existingRefundRequest) {
      throw new ConflictException('There is already a pending refund request for this invoice');
    }

    // Create refund request
    return await this.refundRequestModel.create({
      ...createRefundRequestDto,
      residenceId: new Types.ObjectId(invoice.residenceId),
      invoiceId: new Types.ObjectId(createRefundRequestDto.invoiceId),
      reasonId: new Types.ObjectId(createRefundRequestDto.reasonId),
      status: RefundRequestStatus.REQUESTED,
      createdById: userId,
      updatedById: userId,
    });
  }

  async getRefundRequests(query: ListRefundRequestsDto) {
    const { status, search, residenceId, developerId, reasonTypeId } = query;
    const matchStage: any = {
      isDeleted: false,
    };

    if (status) {
      matchStage.status = status;
    }

    if (residenceId) {
      matchStage['invoice.residenceId'] = new Types.ObjectId(residenceId);
    }

    if (developerId) {
      matchStage['invoice.developerId'] = new Types.ObjectId(developerId);
    }

    if (reasonTypeId) {
      matchStage['reasonId'] = new Types.ObjectId(reasonTypeId);
    }

    const pipeline = [
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice',
        },
      },
      {
        $unwind: {
          path: '$invoice',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'residences',
          localField: 'invoice.residenceId',
          foreignField: '_id',
          as: 'residence',
        },
      },
      {
        $unwind: {
          path: '$residence',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'refundrequestreasons',
          localField: 'reasonId',
          foreignField: '_id',
          as: 'reason',
        },
      },
      {
        $unwind: {
          path: '$reason',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
    ] as any;

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { note: { $regex: search, $options: 'i' } },
            { 'residence.name': { $regex: search, $options: 'i' } },
            { 'invoice.invoiceNumber': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    pipeline.push({
      $project: {
        id: '$_id',
        createdAt: 1,
        amount: 1,
        status: 1,
        note: 1,
        invoiceId: '$invoice._id',
        invoiceNumber: '$invoice.invoiceNumber',
        issuedAt: '$invoice.issuedAt',
        dueAt: '$invoice.dueAt',
        total: '$invoice.total',
        residenceName: '$residence.name',
        residenceId: '$residence._id',
        reason: 1,
        paymentMethodType: '$invoice.paymentMethodType',
        invoiceScheduleId: '$invoice.invoiceScheduleId',
      },
    });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $skip: (query.page - 1) * query.limit },
      { $limit: query.limit },
    ];

    const [countResult, data] = await Promise.all([
      this.refundRequestModel.aggregate(countPipeline),
      this.refundRequestModel.aggregate(dataPipeline),
    ]);

    const count = countResult[0]?.total || 0;
    const { pagination } = PaginationService.paginate({ rows: data, count }, query);

    return { pagination, refundRequests: data };
  }

  async rejectRefundRequest(refundRequestId: string) {
    const refundRequest = await this.refundRequestModel.findById(refundRequestId);
    if (!refundRequest) {
      throw new NotFoundException('Refund request not found');
    }

    if (refundRequest.status !== RefundRequestStatus.REQUESTED) {
      throw new BadRequestException('Refund request is not in requested status');
    }

    refundRequest.status = RefundRequestStatus.REJECTED;
    return await refundRequest.save();
  }

  async approveRefundRequest(refundRequestId: string) {
    // Get the refund request
    const refundRequest = await this.refundRequestModel.findById(refundRequestId);
    if (!refundRequest) {
      throw new NotFoundException('Refund request not found');
    }

    if (refundRequest.status !== RefundRequestStatus.REQUESTED) {
      throw new BadRequestException('Refund request is not in requested status');
    }

    // Get the invoice
    const invoice = await this.invoiceRepository.findById(refundRequest.invoiceId.toString());
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (!invoice.stripeChargeId) {
      throw new BadRequestException('No charge ID found for this invoice');
    }

    try {
      // Create the refund in Stripe
      const stripeRefund = await this.stripeService.createRefund(
        invoice.stripeChargeId,
        refundRequest.amount
      );

      // Update invoice status
      await this.invoiceRepository.update(invoice.id, {
        status: InvoiceStatus.REFUNDED,
        stripeRefundId: stripeRefund.id,
      });

      // Create transaction record
      await this.transactionRepository.create({
        residenceId: invoice.residenceId,
        developerId: invoice.developerId,
        invoiceId: invoice.id,
        amount: refundRequest.amount,
        status: TransactionStatus.REFUNDED,
      });

      // Update refund request
      refundRequest.status = RefundRequestStatus.REFUNDED;
      refundRequest.refundStatus = RefundStatus.CREATED;
      refundRequest.stripeRefundId = stripeRefund.id;
      refundRequest.approvedAt = new Date();
      await refundRequest.save();

      return refundRequest;
    } catch (error) {
      throw new BadRequestException(`Failed to process refund: ${error.message}`);
    }
  }

  async getRefundRequestV2(refundRequestId: string) {
    const refundRequest = await this.refundRequestModel
      .findById(refundRequestId)
      .populate([
        {
          path: 'invoiceId',
        },
        {
          path: 'residenceId',
        },
        {
          path: 'reasonId',
        },
        {
          path: 'uploadIds',
        },
      ])
      .lean();

    if (!refundRequest) {
      throw new NotFoundException('Refund request not found');
    }

    return refundRequest;
  }

  async getResidencePayments(userId: string) {
    const residences = await this.residenceModel
      .find({ developerId: new Types.ObjectId(userId) })
      .populate({
        path: 'activeInvoiceSchedule',
        match: { status: InvoiceScheduleStatus.ACTIVE },
        populate: [
          {
            path: 'currentInvoice',
            populate: {
              path: 'paymentMethod',
            },
          },
          {
            path: 'plan',
          },
          {
            path: 'currentPaymentMethod',
          },
          {
            path: 'paymentMethod',
          },
        ],
      });
    return residences;
  }

  async markInvoiceAsPaidManually(invoiceId: string) {
    // Get the invoice from database
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.PENDING && invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Invoice is not in pending or draft status');
    }

    // If there's a Stripe invoice ID, void it in Stripe
    if (invoice.stripeInvoiceId) {
      await this.stripeService.voidInvoice(invoice.stripeInvoiceId);
    }

    // Update local invoice status
    invoice.status = InvoiceStatus.PAID;
    invoice.paymentMethodType = PaymentMethodType.MANUAL;

    // Save the updated invoice
    const updatedInvoice = await invoice.save();

    return updatedInvoice;
  }

  async cancelInvoice(invoiceId: string) {
    // Get the invoice from database
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.PENDING && invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Invoice is not in pending or draft status');
    }

    // If there's a Stripe invoice ID, void it in Stripe
    if (invoice.stripeInvoiceId) {
      await this.stripeService.voidInvoice(invoice.stripeInvoiceId);
    }

    // Update local invoice status
    invoice.status = InvoiceStatus.CANCELED;

    // Save the updated invoice
    const updatedInvoice = await invoice.save();

    return updatedInvoice;
  }
}
