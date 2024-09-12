import { Injectable } from '@nestjs/common';
import { UnitDraftRepository } from './unitDraft.repository';
import { UnitDraft } from './schema/unitDraft.schema';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListUnitDraftDto } from './dto/listUnitDraft.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { Types } from 'mongoose';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';

@Injectable()
export class UnitDraftService {
  constructor(private readonly unitDraftRepository: UnitDraftRepository) {}

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

    const options = PaginationService.prepareOptions(listUnitDraftDto);

    const { data, count } = await this.unitDraftRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUnitDraftDto);

    return { pagination, unitDraft: data };
  }
}
