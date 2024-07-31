import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceType, ResidenceTypeSchema } from './schema/residenceType.schema';
import { ResidenceTypeService } from './residenceType.service';
import { ResidenceTypeController } from './residenceType.controller';
import { ResidenceTypeRepository } from './residenceType.repository';
import { ResidenceTypeSeeder } from './residenceType.seeder';
import { ResidenceTypeFixture } from './residenceType.fixture';

@Module({
  imports: [MongooseModule.forFeature([{ name: ResidenceType.name, schema: ResidenceTypeSchema }])],
  providers: [ResidenceTypeService, ResidenceTypeRepository, ResidenceTypeSeeder,ResidenceTypeFixture],
  exports: [ResidenceTypeSeeder,ResidenceTypeFixture],
  controllers: [ResidenceTypeController],
})
export class ResidenceTypeModule {}