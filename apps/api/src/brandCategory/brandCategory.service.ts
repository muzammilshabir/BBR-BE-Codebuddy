import { Injectable } from '@nestjs/common';
import { ListBrandDto } from '../brand/dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { BrandCategoryRepository } from './brandCategoryRepository.repository';

@Injectable()
export class BrandCategoryService {
  constructor(private readonly brandCategoryRepository: BrandCategoryRepository) {}

  async findAll(listBrandDto: ListBrandDto) {
    const filter = listBrandDto.search
      ? {
          $or: [{ name: { $regex: listBrandDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listBrandDto);

    const { data, count } = await this.brandCategoryRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBrandDto);

    return { pagination, brandCategories: data };
  }
}
