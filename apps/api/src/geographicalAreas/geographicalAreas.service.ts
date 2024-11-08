import { Injectable } from '@nestjs/common';
import { GeographicalAreasRepository } from './geographicalAreas.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListGeographicalAreasDto } from './dto/listGeographicalAreas.dto';

@Injectable()
export class GeographicalAreasService {
  constructor(private readonly geographicalAreasRepository: GeographicalAreasRepository) {}
  async findAll(llistGeographicalAreasDto: ListGeographicalAreasDto) {
    const filter = llistGeographicalAreasDto.search
      ? {
          $or: [{ name: { $regex: llistGeographicalAreasDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(llistGeographicalAreasDto);

    const { data, count } = await this.geographicalAreasRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      llistGeographicalAreasDto
    );

    return { pagination, data };
  }

  async getGeographicalAreaById(geographicalAreaId: string): Promise<any> {
    return await this.geographicalAreasRepository.findByIdInDetail(geographicalAreaId);
  }
}
