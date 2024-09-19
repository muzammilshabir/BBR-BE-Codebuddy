import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimRequest, ClaimRequestSchema } from './schema/claimRequest.schema';
import { ClaimRequestService } from './claimRequest.service';
import { ClaimRequestController } from './claimRequest.controller';
import { ClaimRequestRepository } from './claimRequest.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: ClaimRequest.name, schema: ClaimRequestSchema }])],
  providers: [ClaimRequestService, ClaimRequestRepository],
  exports: [],
  controllers: [ClaimRequestController],
})
export class ClaimRequestModule {}
