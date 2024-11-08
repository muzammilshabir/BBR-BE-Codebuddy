import { Injectable } from '@nestjs/common';
import { CityRepository } from './city.repository';
import { ListCityDto } from './dto/listCity.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateCityDto } from './dto/updateCity.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class CityService {
  constructor(private readonly cityRepository: CityRepository) {}

  async findAll(listCityDto: ListCityDto) {
    const filter = listCityDto.search
      ? {
          $or: [{ name: { $regex: listCityDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listCityDto);

    const { data, count } = await this.cityRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listCityDto);

    return { pagination, cities: data };
  }

  async update(id: string, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      throw new NotFoundException(`City with id ${id} not found`);
    }

    return await this.cityRepository.update(id, updateCityDto);
  }

  async getCityById(cityId: string): Promise<any> {
    return await this.cityRepository.findByIdInDetail(cityId);
  }
}
