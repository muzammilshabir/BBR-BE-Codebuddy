import { Module } from '@nestjs/common';
import { RequestAVisitController } from './request-a-visit.controller';
import { RequestAVisitService } from './request-a-visit.service';

@Module({
  controllers: [RequestAVisitController],
  providers: [RequestAVisitService]
})
export class RequestAVisitModule {}
