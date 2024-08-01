import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from './schema/upload.schema';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadRepository } from './upload.repository';
import { UploadFixture } from './upload.fixture';
import { UploadSeeder } from './upload.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  providers: [UploadService, UploadRepository,UploadFixture,UploadSeeder],
  exports: [UploadFixture,UploadSeeder],
  controllers: [UploadController],
})
export class UploadModule {}