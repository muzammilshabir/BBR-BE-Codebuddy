import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminNote } from './schema/admin-note.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class AdminNoteRepository extends BaseRepository<AdminNote> {
  constructor(@InjectModel(AdminNote.name) private readonly adminNoteModel: Model<AdminNote>) {
    super(adminNoteModel);
  }
}
