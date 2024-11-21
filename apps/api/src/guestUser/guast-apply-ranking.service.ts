import { Injectable, NotFoundException } from '@nestjs/common';
import { GuestApplyRankingDto } from './guast-apply-ranking.dto';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import { InvoiceService } from 'src/invoice/invoice.service';
import { StripeService } from 'src/stripe/stripe.service';
import { InvoicePostPaymentActionService } from 'src/invoice/invoice-post-payment-action.service';
import { InvoicePostPaymentActionType } from 'src/stripe/schema/invoice-post-payment-action.schema';
import * as argon from 'argon2';
import { PaymentAttemptRepository } from 'src/stripe/payment-attempt.repository';
import { PaymentAttemptStatus } from 'src/stripe/enum/payment-attempt-status.enum';

@Injectable()
export class GuestApplyRankingService {
  constructor(
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly invoiceService: InvoiceService,
    private readonly stripeService: StripeService,
    private readonly invoicePostPaymentActionService: InvoicePostPaymentActionService,
    private readonly paymentAttemptRepository: PaymentAttemptRepository
  ) {}
  async findRankingCategory(body: GuestApplyRankingDto) {
    const rankingCategories = await this.getRankingCategories(body.rankingCategoryIds);

    const stripeCustomer = await this.stripeService.createCustomer({
      name: body.userDetails.fullName,
      email: body.userDetails.email,
    });

    let invoice = await this.invoiceService.createInvoice();
    const stripeInvoice = await this.stripeService.createInvoiceV2(stripeCustomer.id);
    invoice = await this.invoiceService.attachStripeInvoice(invoice.id, stripeInvoice.id);

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
    ]);

    const stripePaymentMethod = await this.stripeService.createPaymentMethod(
      stripeCustomer.id,
      body.stripePmTokenId
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

    return invoice;
  }

  async getRankingCategories(rankingCategoryIds: string[]) {
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
}
