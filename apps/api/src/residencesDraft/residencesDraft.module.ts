import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceDraft, ResidenceDraftSchema } from './schema/residencesDraft.schema';
import { ResidenceDraftService } from './residencesDraft.service';
import { ResidenceDraftController } from './residencesDraft.controller';
import { ResidenceDraftRepository } from './residencesDraft.repository';
import { ResidenceModule } from '../residences/residences.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    ResidenceModule,
  ],
  providers: [ResidenceDraftService, ResidenceDraftRepository],
  exports: [ResidenceDraftService],
  controllers: [ResidenceDraftController],
})
export class ResidenceDraftModule {}
