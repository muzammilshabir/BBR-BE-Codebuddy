import { Injectable } from '@nestjs/common';
import { LifeStyleRepository } from './lifeStyle.repository';
import { ListLifeStylesDto } from './dto/listLifeStyles.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateLifeStyleDto } from './dto/updateLifeStyle.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class ListLifeStyleService {
  constructor(private readonly lifeStyleRepository: LifeStyleRepository) {}

  async findAll(listAmenitiesDto: ListLifeStylesDto) {
    const filter = listAmenitiesDto.search
      ? {
          $or: [{ name: { $regex: listAmenitiesDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listAmenitiesDto);

    const { data, count } = await this.lifeStyleRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listAmenitiesDto);

    return { pagination, lifeStyles: data };
  }

  async update(id: string, updateLifeStyleDto: UpdateLifeStyleDto) {
    const lifeStyle = await this.lifeStyleRepository.findById(id);

    if (!lifeStyle) {
      throw new NotFoundException(`lifeStyle with id ${id} not found`);
    }

    return await this.lifeStyleRepository.update(id, updateLifeStyleDto);
  }
}
