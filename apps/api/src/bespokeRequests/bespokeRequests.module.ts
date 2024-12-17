import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BespokeRequest, BespokeRequestSchema } from './schema/bespokeRequests.schema';
import { BespokeRequestRepository } from './bespokeRequests.repository';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { User } from 'src/users/schema/user.schema';
import { UserRepository } from 'src/users/user.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { ResidenceSchema } from 'src/residences/schema/residences.schema';
import { Residence } from 'src/residences/schema/residences.schema';
import { PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { BespokeRequestService } from './bespokeRequests.service';
import { BespokeRequestController } from './bespokeRequests.controller';
import { InvoiceModule } from '../invoice/invoice.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BespokeRequest.name, schema: BespokeRequestSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    CustomerSupportModule,
    InvoiceModule,
    StripeModule,
  ],
  controllers: [BespokeRequestController],
  providers: [BespokeRequestService, BespokeRequestRepository, UserRepository, ResidenceRepository],
  exports: [BespokeRequestService],
})
export class BespokeRequestModule {}
