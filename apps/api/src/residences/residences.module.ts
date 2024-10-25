import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Residence, ResidenceSchema } from './schema/residences.schema';
import { ResidenceService } from './residences.service';
import { ResidenceController } from './residences.controller';
import { ResidenceRepository } from './residences.repository';
import { ResidenceSeeder } from './residences.seeder';
import { ResidencesFixture } from './residences.fixture';
import { City, CitySchema } from '../city/schema/city.schema';
import { CityRepository } from '../city/city.repository';
import {
  ResidenceDraft,
  ResidenceDraftSchema,
} from '../residencesDraft/schema/residencesDraft.schema';
import { ResidenceDraftRepository } from '../residencesDraft/residencesDraft.repository';
import { ResidenceType, ResidenceTypeSchema } from '../residenceType/schema/residenceType.schema';
import { ResidenceTypeRepository } from '../residenceType/residenceType.repository';
import { Brand, BrandSchema } from '../brand/schema/brand.schema';
import { BrandRepository } from '../brand/brand.repository';
import { User, UserSchema } from '../users/schema/user.schema';
import { UserRepository } from '../users/user.repository';
import {
  ResidenceFeature,
  ResidenceFeatureSchema,
} from '../residenceFeatures/schema/residenceFeatures.schema';
import { ResidenceFeatureRepository } from '../residenceFeatures/residenceFeatures.repository';
import { Amenity, AmenitySchema } from '../amenities/schema/amenities.schema';
import { AmenityRepository } from '../amenities/amenities.repository';
import { LifeStyle, LifeStyleSchema } from '../lifestyles/schema/lifeStyle.schema';
import { LifeStyleRepository } from '../lifestyles/lifeStyle.repository';
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';
import { UnitDraft, UnitDraftSchema } from '../unitDraft/schema/unitDraft.schema';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { UnitRepository } from '../unit/unit.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    MongooseModule.forFeature([{ name: ResidenceType.name, schema: ResidenceTypeSchema }]),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: ResidenceFeature.name, schema: ResidenceFeatureSchema }]),
    MongooseModule.forFeature([{ name: Amenity.name, schema: AmenitySchema }]),
    MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: UnitDraft.name, schema: UnitDraftSchema }]),
  ],
  providers: [
    ResidenceService,
    ResidenceRepository,
    ResidenceSeeder,
    ResidencesFixture,
    CityRepository,
    ResidenceDraftRepository,
    ResidenceTypeRepository,
    BrandRepository,
    UserRepository,
    ResidenceFeatureRepository,
    AmenityRepository,
    LifeStyleRepository,
    UnitRepository,
    UnitDraftRepository,
  ],
  exports: [ResidenceSeeder, ResidencesFixture, ResidenceService, ResidenceRepository],
  controllers: [ResidenceController],
})
export class ResidenceModule {}
