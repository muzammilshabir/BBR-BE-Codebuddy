import { Injectable, BadRequestException } from '@nestjs/common';
import { BespokeRequestRepository } from './bespokeRequests.repository';
import { CreateBespokeRequestDto } from './dto/create-bespoke-request.dto';
import { Types } from 'mongoose';
import { UserRepository } from 'src/users/user.repository';
import { ListBespokeRequestDto } from './dto/list-bespoke-request.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateBespokeRequestDto } from './dto/update-bespoke-info.dto';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { CustomerSupportService } from '../customer-support/customer-support.service';
import { PaymentStatus } from '../rankingRequest/enum/payment-status.enum';
import { UpdateBespokeRequestFeatureDto } from './dto/update-bespoke-request-feature.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { StripeService } from 'src/stripe/stripe.service';
import { InvoicePostPaymentActionService } from 'src/invoice/invoice-post-payment-action.service';
import { InvoicePostPaymentActionType } from 'src/stripe/schema/invoice-post-payment-action.schema';
import { User } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BespokeRequest } from './schema/bespokeRequests.schema';
import { bespokeRequestStatus } from './enum/bespoke-request-status';

export type BespokeRequestFeature = {
  featureName: string;
  monthlyPrice: number;
  rankingCategoryId?: Types.ObjectId;
  custom?: boolean; // Optional due to default value
};
interface UserDetails {
  fullName: string;
  email: string;
}

type CreateBespokeRequestFeatureDto = {
  userDetails: UserDetails;
  bespokeRequest: BespokeRequest;
};

@Injectable()
export class BespokeRequestService {
  constructor(
    private readonly bespokeRequestRepository: BespokeRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly customerSupportService: CustomerSupportService,
    private readonly invoiceService: InvoiceService,
    private readonly stripeService: StripeService,
    private readonly invoicePostPaymentActionService: InvoicePostPaymentActionService,
    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}

  async create(createBespokeRequestDto: CreateBespokeRequestDto, userId: string) {
    if (createBespokeRequestDto.residenceId) {
      const residence = await this.residenceRepository.findById(
        createBespokeRequestDto.residenceId.toString()
      );
      if (!residence) {
        throw new BadRequestException('Residence not found');
      }
    }

    const hasActiveRequest = await this.bespokeRequestRepository.hasActiveOrPendingRequest(
      createBespokeRequestDto?.residenceId?.toString()
    );

    if (hasActiveRequest) {
      throw new BadRequestException('Residence already has an active or pending bespoke request');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const bespokeRequestData: any = {
      ...createBespokeRequestDto,
      createdBy: new Types.ObjectId(userId),
    };

    if (createBespokeRequestDto.residenceId) {
      bespokeRequestData.residenceId = new Types.ObjectId(createBespokeRequestDto.residenceId);
    }

    let bespokeRequest = await this.bespokeRequestRepository.create(bespokeRequestData);

    const message =
      `Bespoke request created with id: ${bespokeRequest.id}` +
      (createBespokeRequestDto.residenceId
        ? ` for residence id: ${createBespokeRequestDto.residenceId}`
        : '');

    const customerSupport = await this.customerSupportService.create({
      name: user.fullName,
      email: user.email,
      message,
      calendlyDetails: createBespokeRequestDto.calendlyDetails ?? null,
    });

    bespokeRequest = await this.bespokeRequestRepository.update(bespokeRequest.id, {
      customerSupportId: customerSupport._id,
    });
    return bespokeRequest;
  }

  async update(id: string, updateBespokeRequestDto: UpdateBespokeRequestDto, userId: string) {
    const bespokeRequest = await this.bespokeRequestRepository.findById(id);

    if (!bespokeRequest) {
      throw new BadRequestException('Bespoke request not found');
    }

    if (updateBespokeRequestDto.calendlyDetails) {
      await this.customerSupportService.updateCustomerSupport(
        bespokeRequest.customerSupportId.toString(),
        {
          calendlyDetails: updateBespokeRequestDto.calendlyDetails,
        }
      );
    }

    return this.bespokeRequestRepository.update(id, {
      ...updateBespokeRequestDto,
      updatedBy: new Types.ObjectId(userId),
    });
  }

  async list(listBespokeRequestDto: ListBespokeRequestDto) {
    const result = await this.bespokeRequestRepository.findAllBespokeRequest(listBespokeRequestDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBespokeRequestDto);
    return { pagination, bespokeRequests: data };
  }

  async findById(id: string) {
    const result = await this.bespokeRequestRepository.findByIdInDetail(id);
    const bespokeRequest = result[0]?.data;
    if (!bespokeRequest) {
      throw new BadRequestException('Bespoke request not found');
    }
    return bespokeRequest?.[0];
  }

  async delete(id: string, userId: string) {
    const bespokeRequest = await this.bespokeRequestRepository.findById(id);
    if (!bespokeRequest) {
      throw new BadRequestException('Bespoke request not found');
    }
    return this.bespokeRequestRepository.update(id, {
      isDeleted: true,
      updatedBy: new Types.ObjectId(userId),
    });
  }

  async finalizeInvoice(invoiceId: string) {
    const invoice = await this.invoiceService.getInvoiceById(invoiceId);

    const stripeInvoice = await this.invoiceService.getStripeInvoiceById(invoice.stripeInvoiceId);
    return this.stripeService.finalizeInvoice(stripeInvoice);
  }

  async createManualInvoice(id: string, updatePaymentInfoDto: UpdateBespokeRequestFeatureDto) {
    const bespokeRequest = await this.bespokeRequestRepository.findById(id);

    if (!bespokeRequest) {
      throw new BadRequestException('Bespoke request not found');
    }

    if (bespokeRequest.status !== bespokeRequestStatus.APPROVED) {
      throw new BadRequestException('Can not create invoice for not approved request');
    }
    const user = await this.userRepository.findById(bespokeRequest.createdBy.toString());

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (bespokeRequest.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Can not create invoice for paid request');
    }
    const updatedBespokeRequest = await this.bespokeRequestRepository.update(id, {
      ...updatePaymentInfoDto,
    });

    if (updatedBespokeRequest.invoiceId) {
      return await this.updateInvoice({
        bespokeRequest: updatedBespokeRequest,
        userDetails: {
          fullName: user.fullName,
          email: user.email,
        },
      });
    }
    return await this.createInvoice({
      bespokeRequest: updatedBespokeRequest,
      userDetails: {
        fullName: user.fullName,
        email: user.email,
      },
    });
  }

  async createInvoice(body: CreateBespokeRequestFeatureDto) {
    const { invoice, stripeCustomer, stripeInvoice } =
      await this.createStripeCustomerAndInvoice(body);

    const lineItems = await this.invoiceService.createLineItemsFromFeatures(
      invoice.id,
      body.bespokeRequest.features
    );

    await this.invoiceService.attachLineItemsToStripeInvoice(
      stripeCustomer.id,
      stripeInvoice.id,
      lineItems
    );

    await this.invoicePostPaymentActionService.create(
      invoice.id,
      InvoicePostPaymentActionType.CREATE_BESPOKE_REQUEST,
      {
        bespokeRequestId: body.bespokeRequest.id,
        userInfo: {
          fullName: body.userDetails.fullName,
          email: body.userDetails.email,
        },
      },
      1
    );

    // TODO: May be used later
    // await this.createStripePaymentMethodAndPayInvoice(
    //   stripeCustomer,
    //   stripeInvoice,
    //   invoice,
    //   body.stripePmTokenId
    // );

    await this.bespokeRequestRepository.update(body.bespokeRequest.id, {
      invoiceId: invoice.id,
    });

    return invoice;
  }

  async updateInvoice(body: CreateBespokeRequestFeatureDto) {
    const invoice = await this.invoiceService.getInvoiceById(body.bespokeRequest.invoiceId);
    const stripeInvoice = await this.invoiceService.getStripeInvoiceById(invoice.stripeInvoiceId);

    const lineItems = await this.invoiceService.createLineItemsFromFeatures(
      invoice.id,
      body.bespokeRequest.features
    );

    await this.invoiceService.updateLineItemsToStripeInvoice(
      stripeInvoice.customer as string,
      invoice.stripeInvoiceId,
      lineItems
    );

    // TODO: May be used later
    // await this.createStripePaymentMethodAndPayInvoice(
    //   stripeCustomer,
    //   stripeInvoice,
    //   invoice,
    //   body.stripePmTokenId
    // );

    await this.bespokeRequestRepository.update(body.bespokeRequest.id, {
      invoiceId: invoice.id,
    });

    return invoice;
  }

  private async createStripeCustomerAndInvoice(body: CreateBespokeRequestFeatureDto) {
    const { email, fullName } = body.userDetails;

    const stripeCustomer = await this.getOrCreateStripeCustomer(email, fullName);

    const invoice = await this.invoiceService.createInvoice();
    const stripeInvoice = await this.stripeService.createInvoiceV2(stripeCustomer.id);
    await this.invoiceService.attachStripeInvoice(invoice.id, stripeInvoice.id);

    return { invoice, stripeCustomer, stripeInvoice };
  }
  private async getOrCreateStripeCustomer(email: string, fullName: string) {
    const user = await this.userModel.findOne({ email });
    if (user?.stripeCustomerId) {
      return this.stripeService.retrieveCustomer(user.stripeCustomerId);
    }
    const stripeCustomer = await this.stripeService.createCustomer({ name: fullName, email });
    await this.userModel.findByIdAndUpdate(user?._id, { stripeCustomerId: stripeCustomer.id });
    return stripeCustomer;
  }
}
