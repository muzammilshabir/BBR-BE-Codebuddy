import { Injectable } from '@nestjs/common';
import { ResidenceServiceRepository } from './residenceService.repository';
import { ListResidenceServiceDto } from './dto/residenceService.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

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

    const { data, count } = await this.residenceServiceRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listResidenceServiceDto
    );

    return { pagination, residenceServiceType: data };
  }
}
