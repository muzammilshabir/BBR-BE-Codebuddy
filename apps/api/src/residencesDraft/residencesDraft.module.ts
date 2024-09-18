import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceDraft, ResidenceDraftSchema } from './schema/residencesDraft.schema';
import { ResidenceDraftService } from './residencesDraft.service';
import { ResidenceDraftController } from './residencesDraft.controller';
import { ResidenceDraftRepository } from './residencesDraft.repository';
import { ResidenceModule } from '../residences/residences.module';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { ResidenceRepository } from '../residences/residences.repository';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { UnitRepository } from '../unit/unit.repository';
import { UnitDraft, UnitDraftSchema } from '../unitDraft/schema/unitDraft.schema';
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    ResidenceModule,
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: UnitDraft.name, schema: UnitDraftSchema }]),
  ],
  providers: [
    ResidenceDraftService,
    ResidenceDraftRepository,
    ResidenceRepository,
    UnitRepository,
    UnitDraftRepository,
  ],
  exports: [ResidenceDraftService],
  controllers: [ResidenceDraftController],
})
export class ResidenceDraftModule {}
