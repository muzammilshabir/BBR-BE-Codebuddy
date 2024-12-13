import { Module } from '@nestjs/common';
import { StateController } from './state.controller';
import { StateService } from './state.service';
import { MongooseModule } from '@nestjs/mongoose';
import { State, StateSchema } from './schema/state.schema';
import { StateRepository } from './state.repository';
import { CountryRepository } from 'src/country/country.repository';
import { Country, CountrySchema } from 'src/country/schema/country.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
  ],
  controllers: [StateController],
  providers: [StateService, StateRepository, CountryRepository]  
})
export class StateModule {}
