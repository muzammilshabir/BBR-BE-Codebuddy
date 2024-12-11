import { Injectable } from '@nestjs/common';
import { EditorNoteRepository } from './editor-note.repository';
import { CreateEditorNoteDto } from './dto/create-editor-note.dto';
import { Types } from 'mongoose';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateEditorNoteDto } from './dto/update-editor-note.dto';
import { ListEditorEditorDto } from './dto/list-editor-note.dto';

@Injectable()
export class EditorNoteService {
  constructor(private readonly editorNoteRepository: EditorNoteRepository) {}

  async create(createEditorNoteDto: CreateEditorNoteDto) {
    const isExistEditorNote = await this.editorNoteRepository.find({
      residenceId: new Types.ObjectId(createEditorNoteDto.residenceId),
    });

    if (isExistEditorNote) {
      return await this.editorNoteRepository.update(isExistEditorNote.id, {
        notes: createEditorNoteDto.notes,
      });
    }
    const editorNote = {
      ...createEditorNoteDto,
      residenceId: new Types.ObjectId(createEditorNoteDto.residenceId),
    };
    return this.editorNoteRepository.create(editorNote);
  }

  async update(id: string, updateData: UpdateEditorNoteDto) {
    const editorNote = await this.editorNoteRepository.findById(id);
    if (!editorNote) {
      throw new NotFoundException(`Editor note with ID ${id} not found`);
    }

    return this.editorNoteRepository.update(id, updateData);
  }

  async findByResidenceId(residenceId: string) {
    const editorNote = await this.editorNoteRepository.find({
      residenceId: new Types.ObjectId(residenceId),
    });
    if (!editorNote) {
      throw new NotFoundException(`Editor note with residence ${residenceId} not found`);
    }
    return editorNote;
  }

  async delete(id: string) {
    const editorNote = await this.editorNoteRepository.findById(id);
    if (!editorNote) {
      throw new NotFoundException(`Editor note with ID ${id} not found`);
    }

    return this.editorNoteRepository.update(id, { isDeleted: true });
  }

  async findAll(listEditorEditorDto: ListEditorEditorDto) {
    const { search, residenceId } = listEditorEditorDto;

    const query: any = {
      isDeleted: { $ne: true },
    };

    if (search) {
      query.$or = [
        { 'notes.topic': { $regex: search, $options: 'i' } },
        { 'notes.description': { $regex: search, $options: 'i' } },
      ];
    }

    if (residenceId) {
      query.residenceId = new Types.ObjectId(residenceId);
    }

    const options = PaginationService.prepareOptions(listEditorEditorDto);

    const { data, count } = await this.editorNoteRepository.findAll(query, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listEditorEditorDto);

    return { pagination, editorNotes: data };
  }
}
