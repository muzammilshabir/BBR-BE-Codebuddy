import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitDraft, UnitDraftSchema } from './schema/unitDraft.schema';
import { UnitDraftService } from './unitDraft.service';
import { UnitDraftController } from './unitDraft.controller';
import { UnitDraftRepository } from './unitDraft.repository';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { UnitRepository } from '../unit/unit.repository';
import { Residence, ResidenceSchema } from 'src/residences/schema/residences.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UnitDraft.name, schema: UnitDraftSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
  ],
  providers: [UnitDraftService, UnitDraftRepository, UnitRepository],
  exports: [],
  controllers: [UnitDraftController],
})
export class UnitDraftModule {}
