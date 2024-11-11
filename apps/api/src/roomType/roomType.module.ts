import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomType, RoomTypeSchema } from './schema/roomType.schema';
import { RoomTypeService } from './roomType.service';
import { RoomTypeController } from './roomType.controller';
import { RoomTypeRepository } from './roomType.repository';
import { RoomTypeSeeder } from './roomType.seeder';
import { Upload } from '@aws-sdk/lib-storage';
import { UploadSchema } from '../upload/schema/upload.schema';
import { UploadRepository } from '../upload/upload.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomType.name, schema: RoomTypeSchema }]),
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
  ],
  providers: [RoomTypeService, RoomTypeRepository, RoomTypeSeeder, UploadRepository],
  exports: [RoomTypeSeeder],
  controllers: [RoomTypeController],
})
export class RoomTypeModule {}
