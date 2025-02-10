import { ResidenceActivityLogRepository } from './../residence-activity-log/residence-activity-log.repository';
import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from './../residence-activity-log/schema/residence-activity-log.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingRequestService } from './rankingRequest.service';
import { RankingRequestController } from './rankingRequest.controller';
import { RankingRequestRepository } from './rankingRequest.repository';
import { RankingRequest, RankingRequestSchema } from './schema/rankingRequest.schema';
import { RankingRequestDraftRepository } from '../rankingRequestDraft/rankingRequestDraft.repository';
import {
  RankingRequestDraft,
  RankingRequestDraftSchema,
} from '../rankingRequestDraft/schema/rankingRequestDraft.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { UserRepository } from '../users/user.repository';
import { ResidenceRepository } from '../residences/residences.repository';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { RankingCategoryRepository } from '../rankingCategory/rankingCategory.repository';
import {
  RankingCategory,
  RankingCategorySchema,
} from '../rankingCategory/schema/rankingCategory.schema';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';
import { DevResidenceActivityLogRepository } from 'src/dev-residence-activity-log/dev-residence-activity-log.repository';
import {
  DevResidenceActivityLog,
  DevResidenceActivityLogSchema,
} from 'src/dev-residence-activity-log/schema/dev-residence-activity-log.schema';
import {
  RankingActivityLog,
  RankingActivityLogSchema,
} from 'src/ranking-activity-log/schema/ranking-activity-log.schema';
import { RankingActivityLogRepository } from 'src/ranking-activity-log/ranking-activity-log.repository';
import { DevRankingActivityLogRepository } from 'src/dev-ranking-activity-log/dev-ranking-activity-log.repository';
import {
  DevRankingActivityLog,
  DevRankingActivityLogSchema,
} from 'src/dev-ranking-activity-log/schema/dev-ranking-activity-log.schema';
import { Country, CountrySchema } from 'src/country/schema/country.schema';
import { City, CitySchema } from 'src/city/schema/city.schema';
import { Brand, BrandSchema } from 'src/brand/schema/brand.schema';
import { GeographicalAreas, GeographicalAreasSchema } from 'src/geographicalAreas/schema/geographicalAreas.schema';
import { LifeStyle, LifeStyleSchema } from 'src/lifestyles/schema/lifeStyle.schema';
import { PropertyType, PropertyTypeSchema } from 'src/propertyType/schema/propertyType.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
    MongooseModule.forFeature([
      { name: RankingRequestDraft.name, schema: RankingRequestDraftSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DevResidenceActivityLog.name, schema: DevResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: RankingActivityLog.name, schema: RankingActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DevRankingActivityLog.name, schema: DevRankingActivityLogSchema },
    ]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: GeographicalAreas.name, schema: GeographicalAreasSchema }]),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }]),
    MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }]),
  ],
  controllers: [RankingRequestController],
  providers: [
    RankingRequestService,
    RankingRequestRepository,
    RankingRequestDraftRepository,
    UserRepository,
    ResidenceRepository,
    RankingCategoryRepository,
    ResidenceActivityLogRepository,
    RankingCategoryRepository,
    DevResidenceActivityLogRepository,
    DeveloperProfileActivityLogRepository,
    RankingActivityLogRepository,
    DevRankingActivityLogRepository,
  ],
})
export class RankingRequestModule {}
