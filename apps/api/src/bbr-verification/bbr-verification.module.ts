import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BbrVerification, BbrVerificationSchema } from './schema/bbr-verification.schema';
import { BbrVerificationController } from './bbr-verification.controller';
import { BbrVerificationService } from './bbr-verification.service';
import { BbrVerificationRepository } from './bbr-verification.repository';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { User } from 'src/users/schema/user.schema';
import { UserRepository } from 'src/users/user.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { ResidenceSchema } from 'src/residences/schema/residences.schema';
import { Residence } from 'src/residences/schema/residences.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { PlanSchema } from 'src/subscription-plan/schema/plan.schema';
import { Plan } from 'src/subscription-plan/schema/plan.schema';
import { PlanRepository } from 'src/subscription-plan/plan.repository';
import { ResidenceActivityLog, ResidenceActivityLogSchema } from 'src/residence-activity-log/schema/residence-activity-log.schema';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BbrVerification.name, schema: BbrVerificationSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    MongooseModule.forFeature([{ name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema }]),
    CustomerSupportModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [BbrVerificationController],
  providers: [
    BbrVerificationService,
    BbrVerificationRepository,
    UserRepository,
    ResidenceRepository,
    PlanRepository,
    ResidenceActivityLogRepository,
  ],
  exports: [BbrVerificationService],
})
export class BbrVerificationModule {}
