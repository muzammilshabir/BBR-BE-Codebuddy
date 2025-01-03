import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminNote, AdminNoteSchema } from './schema/admin-note.schema';
import { AdminNoteController } from './admin-note.controller';
import { AdminNoteService } from './admin-note.service';
import { AdminNoteRepository } from './admin-note.repository';
import { LeadModule } from 'src/lead/lead.module';
import {
  SupportActivityLog,
  SupportActivityLogSchema,
} from 'src/support-activity-log/schema/support-activity-log.schema';
import { SupportActivityLogRepository } from 'src/support-activity-log/support-activity-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdminNote.name, schema: AdminNoteSchema }]),
    MongooseModule.forFeature([
      { name: SupportActivityLog.name, schema: SupportActivityLogSchema },
    ]),
    LeadModule,
  ],
  controllers: [AdminNoteController],
  providers: [AdminNoteService, AdminNoteRepository, SupportActivityLogRepository],
  exports: [AdminNoteService],
})
export class AdminNoteModule {}
