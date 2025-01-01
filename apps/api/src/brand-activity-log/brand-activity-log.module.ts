import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BrandActivityLog,
  BrandActivityLogSchema,
} from './schema/brand-activity-log.schema';
import { BrandActivityLogService } from './brand-activity-log.service';
import { BrandActivityLogRepository } from './brand-activity-log.repository';
import { BrandActivityLogController } from './brand-activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrandActivityLog.name, schema: BrandActivityLogSchema },
    ]),
  ],
  providers: [BrandActivityLogService, BrandActivityLogRepository],
  controllers: [BrandActivityLogController],
  exports: [BrandActivityLogService, BrandActivityLogRepository],
})
export class BrandActivityLogModule {}
