import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { GuestApplyRankingDto } from './guast-apply-ranking.dto';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import { InvoiceService } from 'src/invoice/invoice.service';
import { StripeService } from 'src/stripe/stripe.service';
import { InvoicePostPaymentActionService } from 'src/invoice/invoice-post-payment-action.service';
import { InvoicePostPaymentActionType } from 'src/stripe/schema/invoice-post-payment-action.schema';
import * as argon from 'argon2';
import { PaymentAttemptRepository } from 'src/stripe/payment-attempt.repository';
import { PaymentAttemptStatus } from 'src/stripe/enum/payment-attempt-status.enum';
import { User } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GuestUploadInventoryDto } from './guest-upload-inventory.dto';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { Invoice } from 'src/stripe/schema/invoice.schema';
import Stripe from 'stripe';
import { GuestPremiumResidenceProfileDto } from './guest-request-premium-residence-profile.dto';
import { GuestRequestVisitDto } from './guest-request-visit.dto';

@Injectable()
export class GuestUserService {
  constructor(
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly invoiceService: InvoiceService,
    private readonly stripeService: StripeService,
    private readonly invoicePostPaymentActionService: InvoicePostPaymentActionService,
    private readonly paymentAttemptRepository: PaymentAttemptRepository,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Plan.name)
    private planModel: Model<Plan>
  ) {}
  async findRankingCategory(body: GuestApplyRankingDto) {
    const rankingCategories = await this.getRankingCategories(body.rankingCategoryIds);

    const { invoice, stripeCustomer, stripeInvoice } =
      await this.createStripeCustomerAndInvoice(body);

    const lineItems = await this.invoiceService.createLineItemsFromRankingCategories(
      invoice.id,
      rankingCategories.data
    );
    await this.invoiceService.attachLineItemsToStripeInvoice(
      stripeCustomer.id,
      stripeInvoice.id,
      lineItems
    );

    await Promise.all([
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_USER,
        {
          ...body.userDetails,
          stripeCustomerId: stripeCustomer.id,
          password: await argon.hash(body.userDetails.password),
        }
      ),
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_RESIDENCE,
        body.residenceDetails
      ),
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_RANKING_REQUEST,
        {
          rankingCategoryIds: body.rankingCategoryIds,
        }
      ),
    ]);

    await this.createStripePaymentMethodAndPayInvoice(
      stripeCustomer,
      stripeInvoice,
      invoice,
      body.stripePmTokenId
    );

    return true;
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

  async uploadInventory(body: GuestUploadInventoryDto) {
    const subscriptionPlan = await this.getSubsPlan(body.subscriptionPlanId);

    const { invoice, stripeCustomer, stripeInvoice } =
      await this.createStripeCustomerAndInvoice(body);

    const lineItems = await this.invoiceService.createLineItemsFromSubscriptionPlan(
      invoice.id,
      subscriptionPlan
    );
    await this.invoiceService.attachLineItemsToStripeInvoice(stripeCustomer.id, stripeInvoice.id, [
      lineItems,
    ]);

    await Promise.all([
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_USER,
        {
          ...body.userDetails,
          stripeCustomerId: stripeCustomer.id,
          password: await argon.hash(body.userDetails.password),
        }
      ),
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_RESIDENCE,
        body.residenceDetails
      ),
    ]);

    await this.createStripePaymentMethodAndPayInvoice(
      stripeCustomer,
      stripeInvoice,
      invoice,
      body.stripePmTokenId
    );

    return true;
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

  private async createStripeCustomerAndInvoice(
    body: GuestApplyRankingDto | GuestUploadInventoryDto | GuestRequestVisitDto
  ) {
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

  async requestPremiumResidenceProfile(body: GuestPremiumResidenceProfileDto) {
    const subscriptionPlan = await this.getPremiumResidenceProfilePlan();

    const { invoice, stripeCustomer, stripeInvoice } = await this.createStripeCustomerAndInvoice({
      ...body,
      subscriptionPlanId: subscriptionPlan.id,
    });

    const lineItems = await this.invoiceService.createLineItemsFromSubscriptionPlan(
      invoice.id,
      subscriptionPlan
    );
    await this.invoiceService.attachLineItemsToStripeInvoice(stripeCustomer.id, stripeInvoice.id, [
      lineItems,
    ]);

    await Promise.all([
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_USER,
        {
          ...body.userDetails,
          stripeCustomerId: stripeCustomer.id,
          password: await argon.hash(body.userDetails.password),
        }
      ),
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_RESIDENCE,
        body.residenceDetails
      ),
    ]);

    await this.createStripePaymentMethodAndPayInvoice(
      stripeCustomer,
      stripeInvoice,
      invoice,
      body.stripePmTokenId
    );

    return true;
  }

  private async getPremiumResidenceProfilePlan() {
    const subscriptionPlan = await this.planModel.findOne({
      name: 'Premium Residence Profile',
      active: true,
      isDeleted: false,
    });

    if (!subscriptionPlan) {
      throw new NotFoundException('Premium residence profile plan not found');
    }

    return subscriptionPlan;
  }

  async RequestVisit(body: GuestRequestVisitDto){
    const subscriptionPlan = await this.getSubsPlan(body.subscriptionPlanId);

    const { invoice, stripeCustomer, stripeInvoice } =
    await this.createStripeCustomerAndInvoice(body);

    const lineItems = await this.invoiceService.createLineItemsFromSubscriptionPlan(
      invoice.id,
      subscriptionPlan
    );

    await this.invoiceService.attachLineItemsToStripeInvoice(stripeCustomer.id, stripeInvoice.id, [
      lineItems,
    ]);

    await Promise.all([
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_USER,
        {
          ...body.userDetails,
          stripeCustomerId: stripeCustomer.id,
          password: await argon.hash(body.userDetails.password),
        }
      ),
      this.invoicePostPaymentActionService.create(
        invoice.id,
        InvoicePostPaymentActionType.CREATE_RESIDENCE,
        body.residenceDetails
      ),
    ]);

    await this.createStripePaymentMethodAndPayInvoice(
      stripeCustomer,
      stripeInvoice,
      invoice,
      body.stripePmTokenId
    );

    return true;
  }
}
