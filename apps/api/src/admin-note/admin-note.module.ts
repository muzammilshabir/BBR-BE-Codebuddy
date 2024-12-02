import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminNote, AdminNoteSchema } from './schema/admin-note.schema';
import { AdminNoteController } from './admin-note.controller';
import { AdminNoteService } from './admin-note.service';
import { AdminNoteRepository } from './admin-note.repository';
import { LeadModule } from 'src/lead/lead.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: AdminNote.name, schema: AdminNoteSchema }]), LeadModule],
  controllers: [AdminNoteController],
  providers: [AdminNoteService, AdminNoteRepository],
  exports: [AdminNoteService],
})
export class AdminNoteModule {}
