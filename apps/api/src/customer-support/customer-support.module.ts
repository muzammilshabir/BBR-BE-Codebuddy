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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CustomerSupport.name, schema: CustomerSupportSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    CounterModule,
  ],
  providers: [CustomerSupportService, CustomerSupportRepository, ResidenceRepository, UnitRepository],
  exports: [CustomerSupportService],
  controllers: [CustomerSupportController],
})
export class CustomerSupportModule {}
