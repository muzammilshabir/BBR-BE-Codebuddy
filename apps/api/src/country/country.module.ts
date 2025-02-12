import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schema/country.schema';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { CountryRepository } from './country.repository';
import { CountrySeeder } from './country.seeder';
import { ActivateCountrySeeder } from './activateCountry.seeder';
import { RankingCategory, RankingCategorySchema } from 'src/rankingCategory/schema/rankingCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
  ],
  providers: [CountryService, CountryRepository, CountrySeeder, ActivateCountrySeeder],
  exports: [CountrySeeder],
  controllers: [CountryController],
})
export class CountryModule {}
