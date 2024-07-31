import { Injectable } from '@nestjs/common';
import { ResidenceFeatureRepository } from './residenceFeatures.repository';
import { ListResidenceFeaturesDto } from './dto/listResidenceFeatures.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

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

    const { data, count } = await this.residenceFeatureRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listResidenceFeaturesDto
    );

    return { pagination, residenceType: data };
  }
}
