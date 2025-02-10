import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingRequestDraftService } from './rankingRequestDraft.service';
import { RankingRequestDraftController } from './rankingRequestDraft.controller';
import { RankingRequestDraftRepository } from './rankingRequestDraft.repository';
import {
  RankingRequestDraft,
  RankingRequestDraftSchema,
} from './schema/rankingRequestDraft.schema';
import {
  RankingRequest,
  RankingRequestSchema,
} from '../rankingRequest/schema/rankingRequest.schema';
import { RankingRequestModule } from '../rankingRequest/rankingRequest.module';
import { RankingRequestRepository } from '../rankingRequest/rankingRequest.repository';
import { Country, CountrySchema } from 'src/country/schema/country.schema';
import { City, CitySchema } from 'src/city/schema/city.schema';
import { Brand, BrandSchema } from 'src/brand/schema/brand.schema';
import {
  GeographicalAreas,
  GeographicalAreasSchema,
} from 'src/geographicalAreas/schema/geographicalAreas.schema';
import { LifeStyle, LifeStyleSchema } from 'src/lifestyles/schema/lifeStyle.schema';
import { PropertyType, PropertyTypeSchema } from 'src/propertyType/schema/propertyType.schema';
import { Residence, ResidenceSchema } from 'src/residences/schema/residences.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RankingRequestDraft.name, schema: RankingRequestDraftSchema },
    ]),
    RankingRequestModule,
    MongooseModule.forFeature([{ name: RankingRequest.name, schema: RankingRequestSchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: GeographicalAreas.name, schema: GeographicalAreasSchema }]),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }]),
    MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
  ],
  providers: [RankingRequestDraftService, RankingRequestDraftRepository, RankingRequestRepository],
  exports: [RankingRequestDraftService],
  controllers: [RankingRequestDraftController],
})
export class RankingRequestDraftModule {}
