import { Injectable } from '@nestjs/common';
import { LocationRepository } from './location.repository';
import { ListLocationDto } from './dto/listlocation.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  async findAll(listLocationDto: ListLocationDto) {
    const filter: any = {};

    if (listLocationDto.search) {
      filter.$or = [
        { name: { $regex: listLocationDto.search, $options: 'i' } },
      ];
    }
  
    if (listLocationDto.locationFilter) {
      filter.type = listLocationDto.locationFilter;
    }
      

    const options = PaginationService.prepareOptions(listLocationDto);

    const { data, count } = await this.locationRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listLocationDto);

    return { pagination, locations: data };
  }

}