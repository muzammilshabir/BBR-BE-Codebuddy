import { Injectable } from '@nestjs/common';
import { SectionRepository } from './section.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListSectionDto } from './dto/listSection.dto';

@Injectable()
export class SectionService {
  constructor(private readonly sectionRepository: SectionRepository) {}
  async findAll(listSectionDto: ListSectionDto) {
    const filter = listSectionDto.search
      ? {
          $or: [{ name: { $regex: listSectionDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listSectionDto);

    const { data, count } = await this.sectionRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listSectionDto);

    return { pagination, residenceServiceType: data };
  }
}
