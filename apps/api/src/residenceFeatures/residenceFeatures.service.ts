import { Injectable } from '@nestjs/common';
import { ResidenceFeatureRepository } from './residenceFeatures.repository';
import { ListResidenceFeaturesDto } from './dto/listResidenceFeatures.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateResidenceFeaturesDto } from './dto/updateResidenceFeatures.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class ResidenceFeatureService {
  constructor(private readonly residenceFeatureRepository: ResidenceFeatureRepository) {}

  async findAll(listResidenceFeaturesDto: ListResidenceFeaturesDto) {
    const filter = listResidenceFeaturesDto.search
      ? {
          $or: [{ name: { $regex: listResidenceFeaturesDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listResidenceFeaturesDto);

    const { data, count } = await this.residenceFeatureRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listResidenceFeaturesDto
    );

    return { pagination, residenceFeature: data };
  }

  async update(id: string, updateResidenceFeaturesDto: UpdateResidenceFeaturesDto) {
    const residenceFeature = await this.residenceFeatureRepository.findById(id);

    if (!residenceFeature) {
      throw new NotFoundException(`residenceFeature with id ${id} not found`);
    }

    return await this.residenceFeatureRepository.update(id, updateResidenceFeaturesDto);
  }
}
