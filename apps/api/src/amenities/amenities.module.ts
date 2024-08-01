import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Amenity, AmenitySchema } from './schema/amenities.schema';
import { AmenityService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { AmenityRepository } from './amenities.repository';
import { AmenitySeeder } from './amenities.seeder';
import { AmenityFixture } from './amenities.fixture';

@Module({
  imports: [MongooseModule.forFeature([{ name: Amenity.name, schema: AmenitySchema }])],
  providers: [AmenityService, AmenityRepository, AmenitySeeder,AmenityFixture],
  exports: [AmenitySeeder,AmenityFixture],
  controllers: [AmenitiesController],
})
export class AmenitiesModule {}