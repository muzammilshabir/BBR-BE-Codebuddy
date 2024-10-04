import { Injectable } from '@nestjs/common';
import { ResidenceTypeRepository } from './residenceType.repository';
import { ListResidenceTypeDto } from './dto/listResidenceType.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateResidenceTypeDto } from './dto/updateResidenceType.dto';

@Injectable()
export class ResidenceTypeService {
  constructor(private readonly residenceTypeRepository: ResidenceTypeRepository) {}

  async findAll(listResidenceTypeDto: ListResidenceTypeDto) {
    const filter = listResidenceTypeDto.search
      ? {
          $or: [{ type: { $regex: listResidenceTypeDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listResidenceTypeDto);

    const { data, count } = await this.residenceTypeRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listResidenceTypeDto);

    return { pagination, residenceType: data };
  }

  async update(id: string, updateResidenceTypeDto: UpdateResidenceTypeDto) {
    const residenceType = await this.residenceTypeRepository.findById(id);

    if (!residenceType) {
      throw new NotFoundException(`residenceType with id ${id} not found`);
    }

    return await this.residenceTypeRepository.update(id, updateResidenceTypeDto);
  }
}
