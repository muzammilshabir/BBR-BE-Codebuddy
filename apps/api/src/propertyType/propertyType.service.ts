import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from './propertyType.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { PropertyTypeDto } from './dto/propertyType.dto';

@Injectable()
export class PropertyTypeService {
  constructor(private readonly propertyTypeRepository: PropertyTypeRepository) {}

  async findAll(propertyTypeDto: PropertyTypeDto) {
    const filter = propertyTypeDto.search
      ? {
          $or: [{ name: { $regex: propertyTypeDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(propertyTypeDto);

    const { data, count } = await this.propertyTypeRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, propertyTypeDto);

    return { pagination, lifeStyles: data };
  }
}
