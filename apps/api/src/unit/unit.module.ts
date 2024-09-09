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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: RoomType.name, schema: RoomTypeSchema }]),
    MongooseModule.forFeature([{ name: ResidenceService.name, schema: ResidenceServiceSchema }]),
    UploadModule,
    ResidenceModule,
  ],
  providers: [
    UnitService,
    UnitRepository,
    UnitFixture,
    RoomTypeRepository,
    ResidenceServiceRepository,
  ],
  exports: [UnitFixture],
  controllers: [UnitController],
})
export class UnitModule {}
