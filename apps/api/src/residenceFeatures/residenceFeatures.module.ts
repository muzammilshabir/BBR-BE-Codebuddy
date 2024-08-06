import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceFeature, ResidenceFeatureSchema } from './schema/residenceFeatures.schema';
import { ResidenceFeatureService } from './residenceFeatures.service';
import { ResidenceFeatureController } from './residenceFeatures.controller';
import { ResidenceFeatureRepository } from './residenceFeatures.repository';
import { ResidenceFeatureSeeder } from './residenceFeatures.seeder';
import { ResidenceFeatureFixture } from './residenceFeature.fixture';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResidenceFeature.name, schema: ResidenceFeatureSchema }]),
  ],
  providers: [
    ResidenceFeatureService,
    ResidenceFeatureRepository,
    ResidenceFeatureSeeder,
    ResidenceFeatureFixture,
  ],
  exports: [ResidenceFeatureSeeder, ResidenceFeatureFixture],
  controllers: [ResidenceFeatureController],
})
export class ResidenceFeatureModule {}
