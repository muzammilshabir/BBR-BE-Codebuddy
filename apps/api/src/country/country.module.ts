import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schema/country.schema';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { CountryRepository } from './country.repository';
import { CountrySeeder } from './country.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])],
  providers: [CountryService, CountryRepository, CountrySeeder],
  exports: [CountrySeeder],
  controllers: [CountryController],
})
export class CountryModule {}
