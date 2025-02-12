import { Injectable } from '@nestjs/common';
import { LifeStyleRepository } from './lifeStyle.repository';
import { ListLifeStylesDto } from './dto/listLifeStyles.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateLifeStyleDto } from './dto/updateLifeStyle.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';

@Injectable()
export class ListLifeStyleService {
  constructor(
    private readonly lifeStyleRepository: LifeStyleRepository,
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {}

  async findAll(listLifeStylesDto: ListLifeStylesDto) {
    const { search, hasRankingCategory } = listLifeStylesDto;

    // Base filter: search criteria
    const filter: any = search
      ? {
          $or: [{ name: { $regex: search, $options: 'i' } }],
        }
      : {};

    // If hasRankingCategory is true, fetch relevant lifestyles
    if (hasRankingCategory) {
      const rankingLifestyles = await this.rankingCategoryModel.distinct('lifeStyleId', {});

      if (rankingLifestyles.length) {
        filter._id = { $in: rankingLifestyles };
      }
    }

    const options = PaginationService.prepareOptions(listLifeStylesDto);

    const { data, count } = await this.lifeStyleRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listLifeStylesDto);

    return { pagination, lifeStyles: data };
  }

  async update(id: string, updateLifeStyleDto: UpdateLifeStyleDto) {
    const lifeStyle = await this.lifeStyleRepository.findById(id);

    if (!lifeStyle) {
      throw new NotFoundException(`lifeStyle with id ${id} not found`);
    }

    return await this.lifeStyleRepository.update(id, updateLifeStyleDto);
  }

  async findById(id: string) {
    const lifeStyle = await this.lifeStyleRepository.findByIdInDetail(id);

    if (!lifeStyle) {
      throw new NotFoundException(`lifeStyle with id ${id} not found`);
    }

    return lifeStyle;
  }
}
