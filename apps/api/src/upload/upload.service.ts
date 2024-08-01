import { Injectable } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { ListAmenitiesDto } from './dto/listresidences.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class UploadService {
  constructor(private readonly uploadRepository: UploadRepository) {}

  async findAll(listAmenitiesDto: ListAmenitiesDto) {
    const filter = listAmenitiesDto.search
      ? {
          $or: [
            { name: { $regex: listAmenitiesDto.search, $options: 'i' } },
          ],
        }
      : {};

    const options = PaginationService.prepareOptions(listAmenitiesDto);

    const { data, count } = await this.uploadRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listAmenitiesDto);

    return { pagination, uploads: data };
  }

}