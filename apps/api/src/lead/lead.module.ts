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
import { UploadSchema } from 'src/upload/schema/upload.schema';
import { Upload } from 'src/upload/schema/upload.schema';
import { UploadRepository } from 'src/upload/upload.repository';
import { CometChatService } from 'src/users/comet-chat.service';
import { UserSchema } from 'src/users/schema/user.schema';
import { User } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    CounterModule,
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    LeadService,
    LeadRepository,
    ResidenceRepository,
    UnitRepository,
    LeadSeeder,
    UploadRepository,
    CometChatService,
    ResidenceRepository,
  ],
  exports: [LeadSeeder, LeadService],
  controllers: [LeadController],
})
export class LeadModule {}
