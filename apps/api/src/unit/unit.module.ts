import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Unit, UnitSchema } from './schema/unit.schema';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { UnitRepository } from './unit.repository';
import { UnitFixture } from './unit.fixture';
import { UploadModule } from '../upload/upload.module';
import { ResidenceModule } from '../residences/residences.module';
import { RoomType, RoomTypeSchema } from '../roomType/schema/roomType.schema';
import { RoomTypeRepository } from '../roomType/roomType.repository';
import { ResidenceService } from '../residences/residences.service';
import { ResidenceServiceSchema } from '../residenceService/schema/residenceService.schema';
import { ResidenceServiceRepository } from '../residenceService/residenceService.repository';
import { UnitDraft, UnitDraftSchema } from '../unitDraft/schema/unitDraft.schema';
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';
import { Residence, ResidenceSchema } from 'src/residences/schema/residences.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: RoomType.name, schema: RoomTypeSchema }]),
    MongooseModule.forFeature([{ name: ResidenceService.name, schema: ResidenceServiceSchema }]),
    UploadModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: UnitDraft.name, schema: UnitDraftSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
  ],
  providers: [
    UnitService,
    UnitRepository,
    UnitFixture,
    RoomTypeRepository,
    ResidenceServiceRepository,
    UnitDraftRepository,
  ],
  exports: [UnitFixture],
  controllers: [UnitController],
})
export class UnitModule {}
