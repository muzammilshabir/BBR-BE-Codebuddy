import { Module } from '@nestjs/common';
import { GuestApplyRankingService } from './guast-apply-ranking.service';
import { GuestApplyRankingController } from './guestApplyRanking.controller';
import { RankingCategoryModule } from 'src/rankingCategory/rankingCategory.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';

@Module({
  imports: [
    RankingCategoryModule,
    InvoiceModule,
    StripeModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [GuestApplyRankingController],
  providers: [GuestApplyRankingService],
})
export class GuestApplyRankingModule {}
