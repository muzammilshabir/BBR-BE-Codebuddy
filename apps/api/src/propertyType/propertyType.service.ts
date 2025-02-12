import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from './propertyType.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { PropertyTypeDto } from './dto/propertyType.dto';
import { UpdatePropertyTypeDto } from './dto/updatePropertyType.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';

@Injectable()
export class PropertyTypeService {
  constructor(
    private readonly propertyTypeRepository: PropertyTypeRepository,
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {}

  async findAll(propertyTypeDto: PropertyTypeDto) {
    const { search, hasRankingCategory } = propertyTypeDto;

    // Base filter: search criteria
    const filter: any = search ? { $or: [{ name: { $regex: search, $options: 'i' } }] } : {};

    // If hasRankingCategory is true, fetch relevant property types
    if (hasRankingCategory) {
      const rankingPropertyTypes = await this.rankingCategoryModel.distinct('propertyTypeId', {});

      if (rankingPropertyTypes.length) {
        filter._id = { $in: rankingPropertyTypes };
      }
    }

    const options = PaginationService.prepareOptions(propertyTypeDto);

    const { data, count } = await this.propertyTypeRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, propertyTypeDto);

    return { pagination, propertyTypes: data };
  }

  async update(id: string, updatePropertyTypeDto: UpdatePropertyTypeDto) {
    const propertyType = await this.propertyTypeRepository.findById(id);

    if (!propertyType) {
      throw new NotFoundException(`propertyType with id ${id} not found`);
    }

    return await this.propertyTypeRepository.update(id, updatePropertyTypeDto);
  }

  async getPropertyTypeById(geographicalAreaId: string): Promise<any> {
    return await this.propertyTypeRepository.findByIdInDetail(geographicalAreaId);
  }
}
