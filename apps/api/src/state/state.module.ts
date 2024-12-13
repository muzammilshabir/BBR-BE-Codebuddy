import { Module } from '@nestjs/common';
import { StateController } from './state.controller';
import { StateService } from './state.service';
import { MongooseModule } from '@nestjs/mongoose';
import { State, StateSchema } from './schema/state.schema';
import { StateRepository } from './state.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
  ],
  controllers: [StateController],
  providers: [StateService, StateRepository]  
})
export class StateModule {}
