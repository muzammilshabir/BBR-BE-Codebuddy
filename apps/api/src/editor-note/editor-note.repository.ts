import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EditorNote } from './schema/editor-note.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class EditorNoteRepository extends BaseRepository<EditorNote> {
  constructor(@InjectModel(EditorNote.name) private readonly adminNoteModel: Model<EditorNote>) {
    super(adminNoteModel);
  }
}
