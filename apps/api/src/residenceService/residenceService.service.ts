import { Injectable } from '@nestjs/common';
import { ResidenceServiceRepository } from './residenceService.repository';
import { ListResidenceServiceDto } from './dto/residenceService.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateResidenceServiceDto } from './dto/updateResidenceService.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class ResidenceServicesService {
  constructor(private readonly residenceServiceRepository: ResidenceServiceRepository) {}

  async findAll(listResidenceServiceDto: ListResidenceServiceDto) {
    const filter = listResidenceServiceDto.search
      ? {
          $or: [{ type: { $regex: listResidenceServiceDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listResidenceServiceDto);

    const { data, count } = await this.residenceServiceRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listResidenceServiceDto
    );

    return { pagination, residenceServiceType: data };
  }

  async update(id: string, updateResidenceServiceDto: UpdateResidenceServiceDto) {
    const residenceService = await this.residenceServiceRepository.findById(id);

    if (!residenceService) {
      throw new NotFoundException(`residenceService with id ${id} not found`);
    }

    return await this.residenceServiceRepository.update(id, updateResidenceServiceDto);
  }
}
