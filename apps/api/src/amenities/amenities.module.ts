import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Amenity, AmenitySchema } from './schema/amenities.schema';
import { AmenityService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { AmenityRepository } from './amenities.repository';
import { AmenitySeeder } from './amenities.seeder';
import { AmenityFixture } from './amenities.fixture';
import { Upload } from '@aws-sdk/lib-storage';
import { UploadSchema } from '../upload/schema/upload.schema';
import { UploadRepository } from '../upload/upload.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Amenity.name, schema: AmenitySchema }]),
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
  ],
  providers: [AmenityService, AmenityRepository, AmenitySeeder, AmenityFixture, UploadRepository],
  exports: [AmenitySeeder, AmenityFixture],
  controllers: [AmenitiesController],
})
export class AmenitiesModule {}
