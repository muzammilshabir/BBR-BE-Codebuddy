import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Unit, UnitSchema } from './schema/unit.schema';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { UnitRepository } from './unit.repository';
import { UnitFixture } from './unit.fixture';
import { UploadModule } from '../upload/upload.module';
import { ResidenceModule } from '../residences/residences.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    UploadModule,
    ResidenceModule,
  ],
  providers: [UnitService, UnitRepository, UnitFixture],
  exports: [UnitFixture],
  controllers: [UnitController],
})
export class UnitModule {}
