import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceDraft, ResidenceDraftSchema } from './schema/residencesDraft.schema';
import { ResidenceDraftService } from './residencesDraft.service';
import { ResidenceDraftController } from './residencesDraft.controller';
import { ResidenceDraftRepository } from './residencesDraft.repository';
import { ResidenceModule } from '../residences/residences.module';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { ResidenceRepository } from '../residences/residences.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    ResidenceModule,
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
  ],
  providers: [ResidenceDraftService, ResidenceDraftRepository, ResidenceRepository],
  exports: [ResidenceDraftService],
  controllers: [ResidenceDraftController],
})
export class ResidenceDraftModule {}
