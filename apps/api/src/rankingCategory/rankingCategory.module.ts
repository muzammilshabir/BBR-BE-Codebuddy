import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingCategoryService } from './rankingCategory.service';
import { RankingCategoryController } from './rankingCategory.controller';
import { RankingCategory, RankingCategorySchema } from './schema/rankingCategory.schema';
import { RankingCategoryRepository } from './rankingCategory.repository';
import { LifeStyleRepository } from '../lifestyles/lifeStyle.repository';
import { PropertyTypeRepository } from '../propertyType/propertyType.repository';
import { LifeStyle, LifeStyleSchema } from '../lifestyles/schema/lifeStyle.schema';
import { PropertyType, PropertyTypeSchema } from '../propertyType/schema/propertyType.schema';
import { RankingCategoryDraftRepository } from '../rankingCategoryDraft/rankingCategoryDraft.repository';
import {
  RankingCategoryDraft,
  RankingCategoryDraftSchema,
} from '../rankingCategoryDraft/schema/rankingCategoryDraft.schema';
import { Location, LocationSchema } from '../location/schema/location.schema';
import { Country, CountrySchema } from '../country/schema/country.schema';
import { City, CitySchema } from '../city/schema/city.schema';
import { LocationRepository } from '../location/location.repository';
import { CountryRepository } from '../country/country.repository';
import { CityRepository } from '../city/city.repository';
import {
  GeographicalAreas,
  GeographicalAreasSchema,
} from '../geographicalAreas/schema/geographicalAreas.schema';
import { GeographicalAreasRepository } from '../geographicalAreas/geographicalAreas.repository';
import { Brand, BrandSchema } from '../brand/schema/brand.schema';
import { BrandRepository } from '../brand/brand.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }]),
    MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }]),
    MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: GeographicalAreas.name, schema: GeographicalAreasSchema }]),

    MongooseModule.forFeature([
      { name: RankingCategoryDraft.name, schema: RankingCategoryDraftSchema },
    ]),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  controllers: [RankingCategoryController],
  providers: [
    RankingCategoryService,
    RankingCategoryRepository,
    LifeStyleRepository,
    PropertyTypeRepository,
    RankingCategoryDraftRepository,
    LocationRepository,
    CountryRepository,
    CityRepository,
    GeographicalAreasRepository,
    BrandRepository,
  ],
  exports: [RankingCategoryRepository],
})
export class RankingCategoryModule {}
