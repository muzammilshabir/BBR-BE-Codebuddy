import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EditorNote, EditorNoteSchema } from './schema/editor-note.schema';
import { EditorNoteController } from './editor-note.controller';
import { EditorNoteService } from './editor-note.service';
import { EditorNoteRepository } from './editor-note.repository';
import { LeadModule } from 'src/lead/lead.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EditorNote.name, schema: EditorNoteSchema }]),
    LeadModule,
  ],
  controllers: [EditorNoteController],
  providers: [EditorNoteService, EditorNoteRepository],
  exports: [EditorNoteService],
})
export class EditorNoteModule {}
