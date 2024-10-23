import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeographicalAreas, GeographicalAreasSchema } from './schema/geographicalAreas.schema';
import { GeographicalAreasService } from './geographicalAreas.service';
import { GeographicalAreasRepository } from './geographicalAreas.repository';
import { GeographicalAreasSeeder } from './geographicalAreas.seeder';
import { GeographicalAreasController } from './geographicalAreas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GeographicalAreas.name, schema: GeographicalAreasSchema }]),
  ],
  providers: [GeographicalAreasService, GeographicalAreasRepository, GeographicalAreasSeeder],
  exports: [GeographicalAreasSeeder],
  controllers: [GeographicalAreasController],
})
export class GeographicalAreasModule {}
