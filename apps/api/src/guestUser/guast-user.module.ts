import { Module } from '@nestjs/common';
import { GuestUserService } from './guast-user.service';
import { GuestApplyRankingController } from './guestApplyRanking.controller';
import { RankingCategoryModule } from 'src/rankingCategory/rankingCategory.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';
import { Plan, PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { GuestUploadInventoryController } from './guestUploadInventory.controller';
import { GuestPremiumResidenceProfileController } from './guestPremiumResidenceProfile.controller';
import { GuestRequestVisitController } from './guestRequestAVisit.controller';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';

@Module({
  imports: [
    RankingCategoryModule,
    InvoiceModule,
    StripeModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    CustomerSupportModule,
  ],
  controllers: [
    GuestApplyRankingController,
    GuestUploadInventoryController,
    GuestPremiumResidenceProfileController,
    GuestRequestVisitController,
  ],
  providers: [GuestUserService],
})
export class GuestUserModule {}
