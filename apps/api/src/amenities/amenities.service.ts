import { Injectable } from '@nestjs/common';
import { AmenityRepository } from './amenities.repository';
import { ListAmenitiesDto } from './dto/listAmenities.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateAmenityDto } from './dto/updateAmenities.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class AmenityService {
  constructor(private readonly amenityRepository: AmenityRepository) {}

  async findAll(listAmenitiesDto: ListAmenitiesDto) {
    const filter = listAmenitiesDto.search
      ? {
          $or: [{ name: { $regex: listAmenitiesDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listAmenitiesDto);

    const { data, count } = await this.amenityRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listAmenitiesDto);

    return { pagination, amenities: data };
  }

  async update(id: string, updateAmenityDto: UpdateAmenityDto) {
    const amenity = await this.amenityRepository.findById(id);

    if (!amenity) {
      throw new NotFoundException(`Amenity with id ${id} not found`);
    }

    return await this.amenityRepository.update(id, updateAmenityDto);
  }
}
