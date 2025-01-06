import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from './../residence-activity-log/schema/residence-activity-log.schema';
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
import { Country, CountrySchema } from '../country/schema/country.schema';
import { RankingRequestRepository } from 'src/rankingRequest/rankingRequest.repository';
import {
  RankingRequest,
  RankingRequestSchema,
} from 'src/rankingRequest/schema/rankingRequest.schema';
import { ResidenceSeederService } from './residencesSeeder.service';
import { PropertyTypeRepository } from 'src/propertyType/propertyType.repository';
import { PropertyType, PropertyTypeSchema } from 'src/propertyType/schema/propertyType.schema';
import { RankingCategoryRepository } from 'src/rankingCategory/rankingCategory.repository';
import {
  RankingCategory,
  RankingCategorySchema,
} from 'src/rankingCategory/schema/rankingCategory.schema';
import { GeographicalAreasRepository } from 'src/geographicalAreas/geographicalAreas.repository';
import {
  GeographicalAreas,
  GeographicalAreasSchema,
} from 'src/geographicalAreas/schema/geographicalAreas.schema';
import { BrandCategoryRepository } from 'src/brandCategory/brandCategoryRepository.repository';
import { BrandCategory, BrandCategorySchema } from 'src/brandCategory/schema/brandCategory.schema';
import { UploadRepository } from 'src/upload/upload.repository';
import { Upload, UploadSchema } from 'src/upload/schema/upload.schema';
import { State, StateSchema } from 'src/state/schema/state.schema';
import { StateRepository } from 'src/state/state.repository';
import { Location, LocationSchema } from 'src/location/schema/location.schema';
import { BrandDraft, BrandDraftSchema } from '../brandDraft/schema/brandDraft.schema';
import {
  RankingCategoryDraft,
  RankingCategoryDraftSchema,
} from '../rankingCategoryDraft/schema/rankingCategoryDraft.schema';
import {
  RankingRequestDraft,
  RankingRequestDraftSchema,
} from '../rankingRequestDraft/schema/rankingRequestDraft.schema';
import { RankingRequestDraftRepository } from '../rankingRequestDraft/rankingRequestDraft.repository';
import { RankingCategoryDraftRepository } from '../rankingCategoryDraft/rankingCategoryDraft.repository';
import { BrandDraftRepository } from '../brandDraft/brandDraft.repository';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import { BrandActivityLogRepository } from 'src/brand-activity-log/brand-activity-log.repository';
import {
  BrandActivityLog,
  BrandActivityLogSchema,
} from 'src/brand-activity-log/schema/brand-activity-log.schema';
import { DevResidenceActivityLogRepository } from 'src/dev-residence-activity-log/dev-residence-activity-log.repository';
import {
  DevResidenceActivityLog,
  DevResidenceActivityLogSchema,
} from 'src/dev-residence-activity-log/schema/dev-residence-activity-log.schema';

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
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
    MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    MongooseModule.forFeature([{ name: GeographicalAreas.name, schema: GeographicalAreasSchema }]),
    MongooseModule.forFeature([{ name: BrandCategory.name, schema: BrandCategorySchema }]),
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
    MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }]),
    MongooseModule.forFeature([{ name: BrandDraft.name, schema: BrandDraftSchema }]),
    MongooseModule.forFeature([
      { name: RankingCategoryDraft.name, schema: RankingCategoryDraftSchema },
    ]),
    MongooseModule.forFeature([
      { name: RankingRequestDraft.name, schema: RankingRequestDraftSchema },
    ]),
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DevResidenceActivityLog.name, schema: DevResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    MongooseModule.forFeature([{ name: BrandActivityLog.name, schema: BrandActivityLogSchema }]),
  ],
  providers: [
    ResidenceService,
    ResidenceSeederService,
    ResidenceRepository,
    ResidenceSeeder,
    ResidencesFixture,
    CityRepository,
    StateRepository,
    ResidenceDraftRepository,
    ResidenceTypeRepository,
    BrandRepository,
    UserRepository,
    ResidenceFeatureRepository,
    AmenityRepository,
    LifeStyleRepository,
    UnitRepository,
    UnitDraftRepository,
    RankingRequestRepository,
    PropertyTypeRepository,
    RankingCategoryRepository,
    GeographicalAreasRepository,
    BrandCategoryRepository,
    UploadRepository,
    RankingRequestDraftRepository,
    RankingCategoryDraftRepository,
    BrandDraftRepository,
    ResidenceActivityLogRepository,
    DevResidenceActivityLogRepository,
    DeveloperProfileActivityLogRepository,
    BrandActivityLogRepository,
  ],
  exports: [
    ResidenceSeeder,
    ResidencesFixture,
    ResidenceService,
    ResidenceSeederService,
    ResidenceRepository,
  ],
  controllers: [ResidenceController],
})
export class ResidenceModule {}
