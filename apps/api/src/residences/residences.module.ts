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
import {
  ResidenceDraft,
  ResidenceDraftSchema,
} from '../residencesDraft/schema/residencesDraft.schema';
import { ResidenceDraftRepository } from '../residencesDraft/residencesDraft.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
  ],
  providers: [
    ResidenceService,
    ResidenceRepository,
    ResidenceSeeder,
    ResidencesFixture,
    CityRepository,
    ResidenceDraftRepository,
  ],
  exports: [ResidenceSeeder, ResidencesFixture, ResidenceService],
  controllers: [ResidenceController],
})
export class ResidenceModule {}
