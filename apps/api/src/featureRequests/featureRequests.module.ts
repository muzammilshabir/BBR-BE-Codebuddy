import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureRequest, FeatureRequestSchema } from './schema/featureRequest.schema';
import { FeatureRequestController } from './featureRequests.controller';
import { FeatureRequestService } from './featureRequests.service';
import { FeatureRequestRepository } from './featureRequests.repository';
import { CustomerSupportModule } from 'src/customer-support/customer-support.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeatureRequest.name, schema: FeatureRequestSchema },
    ]),
    CustomerSupportModule,
  ],
  controllers: [FeatureRequestController],
  providers: [FeatureRequestService, FeatureRequestRepository],
  exports: [FeatureRequestService],
})
export class FeatureRequestModule {} 