import { Injectable } from '@nestjs/common';
import { ResidenceTypeRepository } from './residenceType.repository';
import { ListResidenceTypeDto } from './dto/listResidenceType.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class ResidenceTypeService {
  constructor(private readonly residenceTypeRepository: ResidenceTypeRepository) {}

  async findAll(listResidenceTypeDto: ListResidenceTypeDto) {
    const filter = listResidenceTypeDto.search
      ? {
          $or: [
            { type: { $regex: listResidenceTypeDto.search, $options: 'i' } },
          ],
        }
      : {};

    const options = PaginationService.prepareOptions(listResidenceTypeDto);

    const { data, count } = await this.residenceTypeRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listResidenceTypeDto);

    return { pagination, residenceType: data };
  }

}