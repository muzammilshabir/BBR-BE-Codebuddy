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
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';
import { UnitDraft, UnitDraftSchema } from '../unitDraft/schema/unitDraft.schema';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { UnitRepository } from '../unit/unit.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: UnitDraft.name, schema: UnitDraftSchema }]),
  ],
  providers: [
    ResidenceService,
    ResidenceRepository,
    ResidenceSeeder,
    ResidencesFixture,
    CityRepository,
    ResidenceDraftRepository,
    UnitRepository,
    UnitDraftRepository,
  ],
  exports: [ResidenceSeeder, ResidencesFixture, ResidenceService],
  controllers: [ResidenceController],
})
export class ResidenceModule {}
