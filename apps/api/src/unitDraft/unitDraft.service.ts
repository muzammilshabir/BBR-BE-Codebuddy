import { Injectable } from '@nestjs/common';
import { UnitDraftRepository } from './unitDraft.repository';
import { UnitDraft } from './schema/unitDraft.schema';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListUnitDraftDto } from './dto/listUnitDraft.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { Types } from 'mongoose';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UnitRepository } from '../unit/unit.repository';

@Injectable()
export class UnitDraftService {
  constructor(
    private readonly unitDraftRepository: UnitDraftRepository,
    private readonly unitRepository: UnitRepository
  ) {}

  async getUnitDraftById(unitId: string): Promise<UnitDraft> {
    const unitDraftDetails = await this.unitDraftRepository.findByIdInDetail(unitId);
    if (!unitDraftDetails) {
      throw new NotFoundException(`Unit draft request with ID ${unitId}`);
    }
    return unitDraftDetails;
  }

  async listDraftUnits(listUnitDraftDto: ListUnitDraftDto) {
    const filter: any = { isDeleted: DeletionStatus.ACTIVE };

    if (listUnitDraftDto.unitId) {
      filter.unitId = new Types.ObjectId(listUnitDraftDto.unitId);
    }

    if (listUnitDraftDto.status) {
      filter.status = listUnitDraftDto.status;
    }

    const options = {
      ...PaginationService.prepareOptions(listUnitDraftDto),
    };

    const { data, count } = await this.unitDraftRepository.findAll(filter, options, [
      {
        path: 'rooms.roomTypeId',
        model: 'RoomType',
        populate: {
          path: 'upload.ImageId',
          model: 'Upload',
          select: 'originalFileKey fileKey url mimeType',
        },
      },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUnitDraftDto);

    return { pagination, unitDraft: data };
  }

  async deleteUnitDraft(unitDraftId: string, userId: string): Promise<UnitDraft> {
    const unitDraft = await this.unitDraftRepository.findById(unitDraftId);
    if (!unitDraft) {
      throw new NotFoundException(`Unit draft with ID ${unitDraftId}`);
    }

    const updatedUnit = await this.unitDraftRepository.update(unitDraftId, {
      isDeleted: DeletionStatus.DELETED,
      updatedById: new Types.ObjectId(userId),
    });

    await this.unitRepository.update(unitDraft.unitId.toString(), {
      isDeleted: DeletionStatus.DELETED,
      updatedById: new Types.ObjectId(userId),
    });
    return updatedUnit;
  }
}
