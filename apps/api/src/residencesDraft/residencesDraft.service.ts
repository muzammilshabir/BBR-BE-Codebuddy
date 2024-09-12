import { Injectable } from '@nestjs/common';
import { ResidenceDraftRepository } from './residencesDraft.repository';
import { ListResidenceDraftDto } from './dto/listResidenceDraft.dto';
import { Types } from 'mongoose';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { ResidenceService } from '../residences/residences.service';

@Injectable()
export class ResidenceDraftService {
  constructor(
    private readonly residenceDraftRepository: ResidenceDraftRepository,
    private readonly residenceService: ResidenceService
  ) {}

  async listResidencesDraft(listResidenceDraftDto: ListResidenceDraftDto) {
    const filter: any = {};
    if (listResidenceDraftDto.status) {
      filter.status = listResidenceDraftDto.status;
    }
    if (listResidenceDraftDto.cityId) {
      filter.cityId = new Types.ObjectId(listResidenceDraftDto.cityId);
    }
    if (listResidenceDraftDto.developerId) {
      filter.developerId = new Types.ObjectId(listResidenceDraftDto.developerId);
    }

    if (listResidenceDraftDto.search) {
      filter.$or = [{ name: { $regex: listResidenceDraftDto.search, $options: 'i' } }];
    }

    const options = PaginationService.prepareOptions(listResidenceDraftDto);

    const { data, count } = await this.residenceDraftRepository.findAll(filter, options, [
      { path: 'residenceTypeId', select: 'type' },
      { path: 'cityId', select: 'name parentId' },
      { path: 'associatedBrandId', select: 'name' },
      {
        path: 'visuals.mainGalleryPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.secondGalleryPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.videoTour',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'nearbyAmenities.amenitiesList', select: 'name', model: 'Amenity' },
      { path: 'nearbyAmenities.highlightedAmenities.amenityId', select: 'name', model: 'Amenity' },
      {
        path: 'nearbyAmenities.highlightedAmenities.imageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'createdById', model: 'User' },
      { path: 'developerId', model: 'User' },
    ]);

    const updatedData = data.map((residence) => {
      const cleanResidence = residence.toObject();

      return {
        ...cleanResidence,
      };
    });
    const transformedResidence = await this.residenceService.transformResidences(updatedData);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listResidenceDraftDto);

    return { pagination, residencesDraft: transformedResidence };
  }
}
