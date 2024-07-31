import { Injectable } from '@nestjs/common';
import { BrandRepository } from './brand.repository';
import { ListBrandDto } from './dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async findAll(listBrandDto: ListBrandDto) {
    const filter = listBrandDto.search
      ? {
          $or: [
            { name: { $regex: listBrandDto.search, $options: 'i' } },
          ],
        }
      : {};

    const options = PaginationService.prepareOptions(listBrandDto);

    const { data, count } = await this.brandRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBrandDto);

    return { pagination, residenceType: data };
  }

}