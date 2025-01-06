import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { InvoiceSchedule, InvoiceScheduleSchema } from './invoiceSchedule.schema';
import { InvoiceScheduleService } from './invoiceSchedule.service';
import { InvoiceScheduleController } from './invoiceSchedule.controller';
import { FeatureSchema } from 'src/subscription-plan/schema/feature.schema';
import { Feature } from 'src/subscription-plan/schema/feature.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { PaymentMethodSchema } from 'src/stripe/schema/payment-method.schema';
import { Residence } from 'src/residences/schema/residences.schema';
import { ResidenceSchema } from 'src/residences/schema/residences.schema';
import { Plan, PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { PaymentMethod } from 'src/stripe/schema/payment-method.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvoiceSchedule.name, schema: InvoiceScheduleSchema },
      { name: User.name, schema: UserSchema },
      { name: Residence.name, schema: ResidenceSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Feature.name, schema: FeatureSchema },
    ]),
  ],
  providers: [InvoiceScheduleService],
  controllers: [InvoiceScheduleController],
})
export class InvoiceScheduleModule {}
