import { Injectable } from '@nestjs/common';
import { CountryRepository } from './country.repository';
import { ListCountryDto } from './dto/listCountry.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository) {}

  async findAll(listCountryDto: ListCountryDto) {
    const filter = listCountryDto.search
      ? {
          $or: [{ name: { $regex: listCountryDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listCountryDto);

    const { data, count } = await this.countryRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listCountryDto);

    return { pagination, lifeStyles: data };
  }
}
