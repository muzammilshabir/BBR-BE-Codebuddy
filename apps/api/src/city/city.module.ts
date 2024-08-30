import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from './schema/city.schema';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { CityRepository } from './city.repository';
import { CitySeeder } from './city.seeder';
import { Country, CountrySchema } from '../country/schema/country.schema';
import { CountryRepository } from '../country/country.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
  ],
  providers: [CityService, CityRepository, CitySeeder, CountryRepository],
  exports: [CitySeeder],
  controllers: [CityController],
})
export class CityModule {}
