import { Injectable } from '@nestjs/common';
import { AdminNoteRepository } from './admin-note.repository';
import { CreateAdminNoteDto } from './dto/create-admin-note.dto';
import { Types } from 'mongoose';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateAdminNoteDto } from './dto/update-admin-note.dto';
import { ListAdminNoteDto } from './dto/list-admin-note.dto';
import { SupportActivityLogRepository } from 'src/support-activity-log/support-activity-log.repository';

@Injectable()
export class AdminNoteService {
  constructor(
    private readonly adminNoteRepository: AdminNoteRepository,
    private readonly supportActivityLogRepository: SupportActivityLogRepository
  ) {}

  async create(createAdminNoteDto: CreateAdminNoteDto, userId: string) {
    const adminNote = {
      ...createAdminNoteDto,
      customerSupportId: new Types.ObjectId(createAdminNoteDto.customerSupportId),
    };
    const note = await this.adminNoteRepository.create(adminNote);

    await this.supportActivityLogRepository.create({
      supportId: new Types.ObjectId(createAdminNoteDto.customerSupportId),
      activityType: 'Note created / edited',
      details: { noteId: note.id },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return note;
  }

  async update(id: string, updateData: UpdateAdminNoteDto, userId: string) {
    const adminNote = await this.adminNoteRepository.findById(id);

    if (!adminNote) {
      throw new NotFoundException(`Admin note with ID ${id} not found`);
    }

    const updatedNote = await this.adminNoteRepository.update(id, updateData);

    await this.supportActivityLogRepository.create({
      supportId: new Types.ObjectId(adminNote.customerSupportId),
      activityType: 'Note created / edited',
      details: { noteId: id },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return updatedNote;
  }

  async getAdminNoteById(id: string) {
    const adminNote = await this.adminNoteRepository.findById(id);
    if (!adminNote) {
      throw new NotFoundException(`Admin note with ID ${id} not found`);
    }

    return adminNote;
  }

  async delete(id: string) {
    const adminNote = await this.adminNoteRepository.findById(id);
    if (!adminNote) {
      throw new NotFoundException(`Admin note with ID ${id} not found`);
    }

    return this.adminNoteRepository.update(id, { isDeleted: true });
  }

  async findAll(listAdminNoteDto: ListAdminNoteDto) {
    const { search, customerSupportId } = listAdminNoteDto;

    const query: any = {
      isDeleted: { $ne: true },
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (customerSupportId) {
      query.customerSupportId = new Types.ObjectId(customerSupportId);
    }

    const options = PaginationService.prepareOptions(listAdminNoteDto);

    const { data, count } = await this.adminNoteRepository.findAll(query, options, [
      {
        path: 'customerSupportId',
        select: 'name email',
        model: 'CustomerSupport',
      },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listAdminNoteDto);

    return { pagination, adminNotes: data };
  }
}
