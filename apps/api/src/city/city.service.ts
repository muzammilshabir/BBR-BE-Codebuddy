import { Injectable } from '@nestjs/common';
import { CityRepository } from './city.repository';
import { ListCityDto } from './dto/listCity.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

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

    const { data, count } = await this.cityRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listCityDto);

    return { pagination, cities: data };
  }
}
