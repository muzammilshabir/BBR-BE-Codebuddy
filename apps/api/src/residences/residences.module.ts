import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Residence, ResidenceSchema } from './schema/residences.schema';
import { ResidenceService } from './residences.service';
import { ResidenceController } from './residences.controller';
import { ResidenceRepository } from './residences.repository';
import { ResidenceSeeder } from './residences.seeder';
import { ResidencesFixture } from './residences.fixture';

@Module({
  imports: [MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }])],
  providers: [ResidenceService, ResidenceRepository, ResidenceSeeder, ResidencesFixture],
  exports: [ResidenceSeeder, ResidencesFixture, ResidenceService],
  controllers: [ResidenceController],
})
export class ResidenceModule {}
