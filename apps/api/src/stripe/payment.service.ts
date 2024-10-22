import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto, SubscriptionItem } from './dto/create-subscription.dto';
import { PaymentLineItemDto } from './dto/payment-line-item.dto';
import { SubscriptionLineItemDto } from './dto/subscription-line-item.dto';
import { UserService } from 'src/users/user.service';
import { ResidenceService } from 'src/residences/residences.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { ChangeSubscriptionPaymentDto } from './dto/change-subscription-payment-method.dto';
import { UpdateSubscriptionDto, UpdateSubscriptionItem } from './dto/update-subscription.dto';
import { Residence } from 'src/residences/schema/residences.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceRepository } from './invoice.repository';
import { Types } from 'mongoose';
import { CreateInvoiceItemsDto, InvoiceItem } from './dto/create-invoice-items.dto';
import { InvoiceItemRepository } from './invoice-item.repository';
import { CreateSubscriptionItemDto } from './dto/create-subscription-item.dto';
import { SubscriptionItemRepository } from './subscription-item.repository';
import { ListInvoicesDto } from './dto/list-invoices.dto';
import { DeletionStatus } from 'src/unit/enum/unit-enum';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { UpdateSubscriptionItemDto } from './dto/update-subscription-item.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly residenceService: ResidenceService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly subscriptionItemRepository: SubscriptionItemRepository,
  ) {}

  private convertPaymentItemsToLineItems(
    residenceId: string,
    items: InvoiceItem[]
  ): PaymentLineItemDto[] {
    const lineItems: PaymentLineItemDto[] = [];

    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              id: residenceId,
              type: item.name,
            },
          },
          unit_amount: item.price,
        },
      });
    }

    return lineItems;
  }

  private convertSubscriptionItemsToLineItems(
    items: SubscriptionItem[]
  ): SubscriptionLineItemDto[] {
    const lineItems: SubscriptionLineItemDto[] = [];

    for (const item of items) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              id: item.residenceId.toString(),
              type: item.type,
            },
          },
          recurring: {
            interval: item.interval,
            interval_count: item.intervalCount,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      });
    }

    return lineItems;
  }

  private convertUpdateSubscriptionItems(
    items: UpdateSubscriptionItem[]
  ): { itemId: string; item: SubscriptionLineItemDto }[] {
    const lineItems: { itemId: string; item: SubscriptionLineItemDto }[] = [];

    for (const item of items) {
      lineItems.push({
        itemId: item.id,
        item: {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: item.description,
              metadata: {
                id: item.residenceId.toString(),
                type: item.type,
              },
            },
            recurring: {
              interval: item.interval,
              interval_count: item.intervalCount,
            },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        },
      });
    }

    return lineItems;
  }

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertSubscriptionItemsToLineItems(
      createSubscriptionDto.subscriptionItems
    );
    return this.stripeService.createSubscriptionInvoice(customerId, lineItems);
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    const lineItems = this.convertPaymentItemsToLineItems(
      createPaymentDto.residenceId.toString(),
      createPaymentDto.paymentItems
    );
    return this.stripeService.createPaymentInvoice(
      customerId,
      createPaymentDto.residenceId.toString(),
      lineItems
    );
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

  async sendInvoiceEmail(invoiceId: string,) {
    const invoice = await this.invoiceRepository.find(invoiceId);
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return 'todo';
  }

  async createInvoiceItems(
    userId: string,
    createInvoiceItemsDto: CreateInvoiceItemsDto,
    asAdmin: boolean,
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

    const lineItems = this.convertPaymentItemsToLineItems(
      invoice.residenceId.toString(),
      createInvoiceItemsDto.invoiceItems,
    );
    const products = await this.stripeService.createProducts(lineItems);
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
    return invoiceItems;
  }

  async updateInvoiceItem(userId: string, invoiceItemId: string, updateInvoiceItemDto: UpdateInvoiceItemDto) {
    const invoiceItem = await this.invoiceItemRepository.findOne(invoiceItemId);
    const invoice = await this.invoiceRepository.find({
      developerId: userId,
      _id: invoiceItem.invoiceId,
    });
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return {
      invoiceItem,
      product: this.stripeService.updateProduct(invoiceItem.stripeProductId, updateInvoiceItemDto)
    };
  }

  async updateInvoiceItemAdmin(invoiceItemId: string, updateInvoiceItemDto: UpdateInvoiceItemDto) {
    const invoiceItem = await this.invoiceItemRepository.findOne(invoiceItemId);
    const invoice = await this.invoiceRepository.findOne(invoiceItem.invoiceId.toString());
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return {
      invoiceItem,
      product: this.stripeService.updateProduct(invoiceItem.stripeProductId, updateInvoiceItemDto)
    };
  }

  async createSubscriptionItem(userId: string, createSubscriptionItemDto: CreateSubscriptionItemDto, asAdmin: boolean) {
    const transformedDto = {
      ...createSubscriptionItemDto,
      invoiceId: new Types.ObjectId(createSubscriptionItemDto.invoiceId),
      createdById: new Types.ObjectId(userId),
    };
  
    const invoice = await this.invoiceRepository.findById(
      createSubscriptionItemDto.invoiceId.toString()
    );
  
    if (!invoice) {
      throw new Error('Invoice not found');
    }
  
    if (!asAdmin && invoice.developerId.toString() !== userId) {
      throw new Error('You are not the developer of this residence');
    }
  
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(createSubscriptionItemDto.invoiceId.toString());
    const invoiceItemIds = invoiceItems.map(item => item.id.toString());
    
    const difference = createSubscriptionItemDto.invoiceItemIds.filter(x => !invoiceItemIds.includes(x));
    if (difference.length > 0) {
      throw new Error('One or more invoice items not found');
    }
  
    return this.subscriptionItemRepository.create(transformedDto);
  }

  async updateSubscriptionItem(userId: string, subscriptionItemId: string, updateSubscriptionItemDto: UpdateSubscriptionItemDto) {
    const subscriptionItem = await this.subscriptionItemRepository.findOne(subscriptionItemId);
    const invoice = await this.invoiceRepository.find({
      developerId: userId,
      _id: subscriptionItem.invoiceId,
    });
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return this.subscriptionItemRepository.update(subscriptionItemId, updateSubscriptionItemDto);
  }

  async updateSubscriptionItemAdmin(subscriptionItemId: string, updateSubscriptionItemDto: UpdateSubscriptionItemDto) {
    const subscriptionItem = await this.subscriptionItemRepository.findOne(subscriptionItemId);
    const invoice = await this.invoiceRepository.findOne(subscriptionItem.invoiceId.toString());
    if (invoice) {
      throw new Error('Invoice not found');
    }
    return this.subscriptionItemRepository.update(subscriptionItemId, updateSubscriptionItemDto);
  }

  async listCustomers() {
    return this.stripeService.listCustomers();
  }

  async getUserPaymentMethods(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerPaymentMethods(customerId);
  }

  async changeSubscriptionPaymentMethod(
    userId: string,
    changeSubscriptionPaymentDto: ChangeSubscriptionPaymentDto
  ) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.changeSubscriptionPaymentMethod(
      customerId,
      changeSubscriptionPaymentDto.subscriptionId,
      changeSubscriptionPaymentDto.paymentMethodId
    );
  }

  async createSetupIntent(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return (await this.stripeService.createSetupIntent(customerId)).client_secret;
  }

  async deletePaymentMethod(userId: string, methodId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.deletePaymentMethod(customerId, methodId);
  }

  async updateSubscription(
    userId: string,
    residenceId: string,
    updateSubscriptionDto: UpdateSubscriptionDto
  ) {
    const residence: Residence = await this.residenceService.getResidenceById(residenceId);
    if (residence.developerId.toString() != userId) {
      throw new Error('Residence not found');
    }
    const lineItems = this.convertUpdateSubscriptionItems(updateSubscriptionDto.subscriptionItems);
    return this.stripeService.updateSubscription(residence.subscriptionId, lineItems);
  }

  async getUserPayments(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerPayments(customerId);
  }

  async getUserSubscriptions(userId: string) {
    const user = await this.userService.findById(userId);
    const customerId = user.stripeCustomerId;
    return this.stripeService.getCustomerSubscriptions(customerId);
  }

  async getAllInvoices(listInvoicesDto: ListInvoicesDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if(listInvoicesDto.search) {
      filter.$or = [
        { "note": { $regex: listInvoicesDto.search, $options: 'i' } },
        { "membershipType": { $regex: listInvoicesDto.search, $options: 'i' } },
        { "tax": { $regex: listInvoicesDto.search, $options: 'i' } },
        { "status": { $regex: listInvoicesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listInvoicesDto);

    const { data, count } = await this.invoiceRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    return { pagination, invoices: data };
  }

  async getUserInvoices(userId: string, listInvoicesDto: ListInvoicesDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      developerId: new Types.ObjectId(userId),
    };

    if(listInvoicesDto.search) {
      filter.$or = [
        { "note": { $regex: listInvoicesDto.search, $options: 'i' } },
        { "membershipType": { $regex: listInvoicesDto.search, $options: 'i' } },
        { "tax": { $regex: listInvoicesDto.search, $options: 'i' } },
        { "status": { $regex: listInvoicesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listInvoicesDto);

    const { data, count } = await this.invoiceRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listInvoicesDto);

    return { pagination, invoices: data };
  }

  async getUserInvoice(userId: string, invoiceId: string) {
    const invoice = await this.invoiceRepository.find({
      developerId: new Types.ObjectId(userId),
      _id: new Types.ObjectId(invoiceId)
    });
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    for (const item of invoiceItems) {
      const product = await this.stripeService.getProduct(item.stripeProductId);
      item['product'] = product;
    }
    const subscriptionItems = await this.subscriptionItemRepository.findByInvoiceId(invoiceId);

    return { invoice, invoiceItems, subscriptionItems };
  }

  async getUserInvoiceAdmin(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne(invoiceId);
    const invoiceItems = await this.invoiceItemRepository.findByInvoiceId(invoiceId);
    for (const item of invoiceItems) {
      const product = await this.stripeService.getProduct(item.stripeProductId);
      item['product'] = product;
    }
    const subscriptionItems = await this.subscriptionItemRepository.findByInvoiceId(invoiceId);

    return { invoice, invoiceItems, subscriptionItems };
  }

  async refundUserInvoice(invoiceId: string, refundPaymentDto: RefundPaymentDto) {
    return this.stripeService.refundInvoice(invoiceId, refundPaymentDto);
  }
}
