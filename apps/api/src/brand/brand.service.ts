import { Injectable } from '@nestjs/common';
import { BrandRepository } from './brand.repository';
import { ListBrandDto } from './dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateBrandDto } from './dto/updateBrand.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async findAll(listBrandDto: ListBrandDto) {
    const filter = listBrandDto.search
      ? {
          $or: [{ name: { $regex: listBrandDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listBrandDto);

    const { data, count } = await this.brandRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBrandDto);

    return { pagination, brands: data };
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    return await this.brandRepository.update(id, updateBrandDto);
  }
}
