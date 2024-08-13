import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from './schema/upload.schema';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';
import { UploadFixture } from './upload.fixture';
import { UploadSeeder } from './upload.seeder';
import { ServiceConfig } from '../config';
import { S3ClientFactory } from './s3.client';

@Module({
  imports: [MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  providers: [
    UploadService,
    UploadRepository,
    UploadFixture,
    UploadSeeder,
    ServiceConfig,
    S3ClientFactory,
  ],
  exports: [UploadFixture, UploadSeeder, UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
