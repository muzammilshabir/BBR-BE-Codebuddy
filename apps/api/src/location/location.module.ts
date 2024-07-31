import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './schema/location.schema';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationRepository } from './location.repository';
import { LocationSeeder } from './location.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }])],
  providers: [LocationService, LocationRepository, LocationSeeder],
  exports: [LocationSeeder],
  controllers: [LocationController],
})
export class LocationModule {}