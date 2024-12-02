import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureRequest, FeatureRequestSchema } from './schema/featureRequest.schema';
import { FeatureRequestController } from './featureRequests.controller';
import { FeatureRequestService } from './featureRequests.service';
import { FeatureRequestRepository } from './featureRequests.repository';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { User } from 'src/users/schema/user.schema';
import { UserRepository } from 'src/users/user.repository';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { ResidenceSchema } from 'src/residences/schema/residences.schema';
import { Residence } from 'src/residences/schema/residences.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { FeatureRequestCronService } from './cron/feature-request-cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeatureRequest.name, schema: FeatureRequestSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    CustomerSupportModule,
    ScheduleModule.forRoot(),

  ],
  controllers: [FeatureRequestController],
  providers: [
    FeatureRequestService,
    FeatureRequestRepository,
    UserRepository,
    ResidenceRepository,
    FeatureRequestCronService,
  ],
  exports: [FeatureRequestService],
})
export class FeatureRequestModule {}
