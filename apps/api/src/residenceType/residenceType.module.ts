import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceType, ResidenceTypeSchema } from './schema/residenceType.schema';
import { ResidenceTypeService } from './residenceType.service';
import { ResidenceTypeController } from './residenceType.controller';
import { ResidenceTypeRepository } from './residenceType.repository';
import { ResidenceTypeSeeder } from './residenceType.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: ResidenceType.name, schema: ResidenceTypeSchema }])],
  providers: [ResidenceTypeService, ResidenceTypeRepository, ResidenceTypeSeeder],
  exports: [ResidenceTypeSeeder],
  controllers: [ResidenceTypeController],
})
export class ResidenceTypeModule {}