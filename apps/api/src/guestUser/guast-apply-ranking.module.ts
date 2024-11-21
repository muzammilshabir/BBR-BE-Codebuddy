import { Module } from '@nestjs/common';
import { GuestApplyRankingService } from './guast-apply-ranking.service';
import { GuestApplyRankingController } from './guestApplyRanking.controller';
import { RankingCategoryModule } from 'src/rankingCategory/rankingCategory.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [RankingCategoryModule, InvoiceModule, StripeModule],
  controllers: [GuestApplyRankingController],
  providers: [GuestApplyRankingService],
})
export class GuestApplyRankingModule {}
