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

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: Feature.name, schema: FeatureSchema }]),
  ],
  controllers: [
    SubscriptionPlanController,
  ],
  providers: [
    SubscriptionPlanService,
    ServiceConfig,
    FeatureRepository,
    PlanRepository,
  ],
  exports: [
    SubscriptionPlanService,
  ],
})
export class SubscriptionPlanModule {}
