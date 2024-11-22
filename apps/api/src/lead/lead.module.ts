import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './schema/lead.schema';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { LeadRepository } from './lead.repository';
import { ResidenceRepository } from '../residences/residences.repository';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { Unit, UnitSchema } from 'src/unit/schema/unit.schema';
import { UnitRepository } from 'src/unit/unit.repository';
import { LeadSeeder } from './lead.seeder';
import { CounterModule } from '../counter/counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    CounterModule,
  ],
  providers: [
    LeadService,
    LeadRepository,
    ResidenceRepository,
    UnitRepository,
    LeadSeeder,

  ],
  exports: [LeadSeeder],
  controllers: [LeadController],
})
export class LeadModule {}
