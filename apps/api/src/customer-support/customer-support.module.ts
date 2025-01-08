import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSupport, CustomerSupportSchema } from './schema/customer-support.schema';
import { CustomerSupportService } from './customer-support.service';
import { CustomerSupportController } from './customer-support.controller';
import { CustomerSupportRepository } from './customer-support.repository';
import { ResidenceRepository } from '../residences/residences.repository';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { Unit, UnitSchema } from 'src/unit/schema/unit.schema';
import { UnitRepository } from 'src/unit/unit.repository';
import { CounterModule } from '../counter/counter.module';
import { UserSchema } from 'src/users/schema/user.schema';
import { User } from 'src/users/schema/user.schema';
import { CustomerSupportConversation, CustomerSupportConversationSchema } from 'src/customer-support-conversation/schema/customer-support-conversation.schema';
import { CustomerSupportConversationRepository } from 'src/customer-support-conversation/customer-support-conversation.repository';
import { UserRepository } from 'src/users/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CustomerSupport.name, schema: CustomerSupportSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: CustomerSupportConversation.name, schema: CustomerSupportConversationSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CounterModule,
  ],
  providers: [CustomerSupportService, CustomerSupportRepository, ResidenceRepository, UnitRepository, CustomerSupportConversationRepository, UserRepository],
  exports: [CustomerSupportService],
  controllers: [CustomerSupportController],
})
export class CustomerSupportModule {}
