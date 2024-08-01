import { Injectable } from '@nestjs/common';
import { AmenityRepository } from './amenities.repository';
import { ListAmenitiesDto } from './dto/listAmenities.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class AmenityService {
  constructor(private readonly amenityRepository: AmenityRepository) {}

  async findAll(listAmenitiesDto: ListAmenitiesDto) {
    const filter = listAmenitiesDto.search
      ? {
          $or: [
            { name: { $regex: listAmenitiesDto.search, $options: 'i' } },
          ],
        }
      : {};

    const options = PaginationService.prepareOptions(listAmenitiesDto);

    const { data, count } = await this.amenityRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listAmenitiesDto);

    return { pagination, amenities: data };
  }

}