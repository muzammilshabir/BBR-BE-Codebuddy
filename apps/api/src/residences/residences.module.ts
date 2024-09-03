import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Residence, ResidenceSchema } from './schema/residences.schema';
import { ResidenceService } from './residences.service';
import { ResidenceController } from './residences.controller';
import { ResidenceRepository } from './residences.repository';
import { ResidenceSeeder } from './residences.seeder';
import { ResidencesFixture } from './residences.fixture';
import { City, CitySchema } from '../city/schema/city.schema';
import { CityRepository } from '../city/city.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
  ],
  providers: [
    ResidenceService,
    ResidenceRepository,
    ResidenceSeeder,
    ResidencesFixture,
    CityRepository,
  ],
  exports: [ResidenceSeeder, ResidencesFixture, ResidenceService],
  controllers: [ResidenceController],
})
export class ResidenceModule {}
