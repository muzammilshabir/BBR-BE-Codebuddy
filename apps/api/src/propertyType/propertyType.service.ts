import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from './propertyType.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { PropertyTypeDto } from './dto/propertyType.dto';
import { UpdatePropertyTypeDto } from './dto/updatePropertyType.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class PropertyTypeService {
  constructor(private readonly propertyTypeRepository: PropertyTypeRepository) {}

  async findAll(propertyTypeDto: PropertyTypeDto) {
    const filter = propertyTypeDto.search
      ? {
          $or: [{ name: { $regex: propertyTypeDto.search, $options: 'i' } }],
        }
      : {};

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
