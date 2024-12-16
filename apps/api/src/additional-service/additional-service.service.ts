import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ApplyAdditionalServiceRequestDto } from './apply-additional-service-request.dto';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import { InvoiceService } from 'src/invoice/invoice.service';
import { StripeService } from 'src/stripe/stripe.service';
import { InvoicePostPaymentActionService } from 'src/invoice/invoice-post-payment-action.service';
import { InvoicePostPaymentActionType } from 'src/stripe/schema/invoice-post-payment-action.schema';
import { PaymentAttemptRepository } from 'src/stripe/payment-attempt.repository';
import { PaymentAttemptStatus } from 'src/stripe/enum/payment-attempt-status.enum';
import { User } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { Invoice } from 'src/stripe/schema/invoice.schema';
import Stripe from 'stripe';
import { BbrVerificationRepository } from 'src/bbr-verification/bbr-verification.repository';
import { FeatureRequestRepository } from 'src/featureRequests/featureRequests.repository';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';
import { BbrVerification } from 'src/bbr-verification/schema/bbr-verification.schema';
import { FeatureRequest } from 'src/featureRequests/schema/featureRequest.schema';

@Injectable()
export class ApplyAdditionalServiceRequestService {
  constructor(
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly invoiceService: InvoiceService,
    private readonly stripeService: StripeService,
    private readonly invoicePostPaymentActionService: InvoicePostPaymentActionService,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    private readonly bbrVerificationRepository: BbrVerificationRepository,
    private readonly featureRequestRepository: FeatureRequestRepository,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Plan.name)
    private planModel: Model<Plan>
  ) {}
  async create(body: ApplyAdditionalServiceRequestDto) {
    let rankingCategories: { data: RankingCategory[] };
    let bbrVerificationRequest: BbrVerification;
    let featureRequest: FeatureRequest;

    const { invoice, stripeCustomer, stripeInvoice } =
      await this.createStripeCustomerAndInvoice(body);

    if (body.rankingCategoryIds && body.rankingCategoryIds.length > 0) {
      rankingCategories = await this.getRankingCategories(body.rankingCategoryIds);

      const lineItems = await this.invoiceService.createLineItemsFromRankingCategories(
        invoice.id,
        rankingCategories.data
      );

      await this.invoiceService.attachLineItemsToStripeInvoice(
        stripeCustomer.id,
        stripeInvoice.id,
        lineItems
      );

      await this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_RANKING_REQUEST,
        {
          rankingCategoryIds: body.rankingCategoryIds,
          userInfo: {
            fullName: body.userDetails.fullName,
            email: body.userDetails.email,
          },
        },
        1
      );
    }

    if (body.bbrVerificationRequestId) {
      bbrVerificationRequest = await this.bbrVerificationRepository.findById(
        body.bbrVerificationRequestId.toString()
      );

      if (!bbrVerificationRequest) {
        throw new NotFoundException('BBR verification request not found');
      }
      const plan = await this.getSubsPlan(bbrVerificationRequest.planId.toString());
      const lineItems = await this.invoiceService.createLineItemsFromSubscriptionPlan(
        invoice.id,
        plan
      );
      await this.invoiceService.attachLineItemsToStripeInvoice(
        stripeCustomer.id,
        stripeInvoice.id,
        [lineItems]
      );

      await this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_BBR_VERIFICATION_REQUEST,
        {
          bbrVerificationRequestId: bbrVerificationRequest.id.toString(),
          userInfo: {
            fullName: body.userDetails.fullName,
            email: body.userDetails.email,
          },
        },
        1
      );
    }

    if (body.featureRequestId) {
      featureRequest = await this.featureRequestRepository.findById(
        body.featureRequestId.toString()
      );

      if (!featureRequest) {
        throw new NotFoundException('Feature request not found');
      }

      const plan = await this.getSubsPlan(featureRequest.planId.toString());
      const lineItems = await this.invoiceService.createLineItemsFromSubscriptionPlan(
        invoice.id,
        plan
      );
      await this.invoiceService.attachLineItemsToStripeInvoice(
        stripeCustomer.id,
        stripeInvoice.id,
        [lineItems]
      );

      await this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_FEATURE_REQUEST,
        {
          featureRequestId: featureRequest.id.toString(),
          userInfo: {
            fullName: body.userDetails.fullName,
            email: body.userDetails.email,
          },
        },
        1
      );
    }

    // TODO: May be used later
    // await this.createStripePaymentMethodAndPayInvoice(
    //   stripeCustomer,
    //   stripeInvoice,
    //   invoice,
    //   body.stripePmTokenId
    // );

    return await this.stripeService.finalizeInvoice(stripeInvoice);
  }

  private async getRankingCategories(rankingCategoryIds: string[]) {
    const rankingCategories = await this.rankingCategoryRepository.findAll({
      _id: { $in: rankingCategoryIds },
      status: 'active',
      isDeleted: { $ne: true },
    });

    const notFoundRankingCategoryIds = rankingCategoryIds.filter(
      (id) => !rankingCategories.data.some((category) => category._id.toString() === id)
    );

    if (notFoundRankingCategoryIds.length > 0) {
      throw new NotFoundException(
        `Ranking categories not found with ids: ${notFoundRankingCategoryIds.join(', ')}`
      );
    }

    return rankingCategories;
  }

  private async getSubsPlan(subscriptionPlanId: string) {
    const subscriptionPlan = await this.planModel.findOne({
      _id: subscriptionPlanId,
      active: true,
      isDeleted: { $ne: true },
    });
    if (!subscriptionPlan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return subscriptionPlan;
  }

  private async createStripeCustomerAndInvoice(body: ApplyAdditionalServiceRequestDto) {
    const user = await this.userModel.findOne({ email: body.userDetails.email });
    if (user) {
      throw new ConflictException('User already exists');
    }

    const stripeCustomer = await this.stripeService.createCustomer({
      name: body.userDetails.fullName,
      email: body.userDetails.email,
    });

    const invoice = await this.invoiceService.createInvoice();
    const stripeInvoice = await this.stripeService.createInvoiceV2(stripeCustomer.id);
    await this.invoiceService.attachStripeInvoice(invoice.id, stripeInvoice.id);

    return { invoice, stripeCustomer, stripeInvoice };
  }

  private async createStripePaymentMethodAndPayInvoice(
    stripeCustomer: Stripe.Customer,
    stripeInvoice: Stripe.Invoice,
    invoice: Invoice,
    stripePmTokenId: string
  ) {
    const stripePaymentMethod = await this.stripeService.createPaymentMethod(
      stripeCustomer.id,
      stripePmTokenId
    );

    await this.stripeService.payInvoiceUsingPaymentMethod(stripeInvoice.id, stripePaymentMethod.id);
    await this.paymentAttemptRepository.create({
      invoiceId: invoice._id,
      paymentMethodId: invoice.paymentMethodId,
      stripeInvoiceId: stripeInvoice.id,
      status: PaymentAttemptStatus.PENDING,
      attemptNumber: 1,
      attemptsRemaining: 0,
      attemptsRemainingToday: 0,
    });
  }
}
