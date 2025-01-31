import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsController } from './backgroundJobs.controller';
import { BulkImageConversionService } from './bulk-image-conversion.service';
import { S3ClientFactory } from 'src/upload/s3.client';
import { ScheduleModule } from '@nestjs/schedule';
import { ImageProcessor } from './image.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'image-processing' }),
    BullBoardModule.forFeature({ name: 'image-processing', adapter: BullMQAdapter }),
  ],
  controllers: [JobsController],
  providers: [BulkImageConversionService, S3ClientFactory, ImageProcessor],
})
export class JobsModule {}
