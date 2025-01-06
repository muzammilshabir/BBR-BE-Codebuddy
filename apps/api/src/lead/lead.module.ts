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
import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from 'src/residence-activity-log/schema/residence-activity-log.schema';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import { DevResidenceActivityLogRepository } from 'src/dev-residence-activity-log/dev-residence-activity-log.repository';
import {
  DevResidenceActivityLog,
  DevResidenceActivityLogSchema,
} from 'src/dev-residence-activity-log/schema/dev-residence-activity-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DevResidenceActivityLog.name, schema: DevResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    CounterModule,
  ],
  providers: [
    LeadService,
    LeadRepository,
    ResidenceRepository,
    UnitRepository,
    LeadSeeder,
    ResidenceActivityLogRepository,
    DevResidenceActivityLogRepository,
    DeveloperProfileActivityLogRepository,
  ],
  exports: [LeadSeeder, LeadService],
  controllers: [LeadController],
})
export class LeadModule {}
