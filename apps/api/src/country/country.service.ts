import { Injectable } from '@nestjs/common';
import { CountryRepository } from './country.repository';
import { ListCountryDto } from './dto/listCountry.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateCountryDto } from './dto/updateCountry.dto';

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

    return { pagination, countries: data };
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    const country = await this.countryRepository.findById(id);

    if (!country) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }

    return await this.countryRepository.update(id, updateCountryDto);
  }
}
