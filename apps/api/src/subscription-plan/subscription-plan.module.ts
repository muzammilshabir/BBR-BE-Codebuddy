import { Module } from '@nestjs/common';
import { ServiceConfig } from 'src/config';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { SubscriptionPlanService } from './subscription-plan.service';
import { UserModule } from 'src/users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from './schema/plan.schema';
import { Feature, FeatureSchema } from './schema/feature.schema';
import { PlanRepository } from './plan.repository';
import { FeatureRepository } from './feature.repository';
import { ResidenceModule } from 'src/residences/residences.module';
import { SubscriptionPlanSeeder } from './subscription-plan.seeder';
import { Subscription, SubscriptionSchema } from 'src/stripe/schema/subscription.schema';
import { SubscriptionRepository } from 'src/stripe/subscription.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Feature.name, schema: FeatureSchema }]),
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
  ],
  controllers: [
    SubscriptionPlanController,
  ],
  providers: [
    SubscriptionPlanService,
    ServiceConfig,
    FeatureRepository,
    SubscriptionRepository,
    PlanRepository,
    SubscriptionPlanSeeder,
  ],
  exports: [
    SubscriptionPlanService,
    SubscriptionPlanSeeder,
  ],
})
export class SubscriptionPlanModule {}
