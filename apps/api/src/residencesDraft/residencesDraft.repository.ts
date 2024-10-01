import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResidenceDraft } from './schema/residencesDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class ResidenceDraftRepository extends BaseRepository<ResidenceDraft> {
  constructor(
    @InjectModel(ResidenceDraft.name) private readonly residenceDraftModel: Model<ResidenceDraft>
  ) {
    super(residenceDraftModel);
  }
  async findByIdInDetail(residenceDraftId: string): Promise<any> {
    const residenceDraft: any = await this.residenceDraftModel.findById(residenceDraftId).populate([
      { path: 'residenceTypeId', select: 'type' },
      { path: 'cityId', select: 'name type countryId' },
      { path: 'countryId', select: 'name type' },
      { path: 'associatedBrandId', select: 'name' },
      { path: 'residenceKeyFeatures.featureIds', select: 'name', model: 'ResidenceFeature' },
      {
        path: 'visuals.mainPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
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
      { path: 'createdById', model: 'User', select: 'fullName email role' },
      { path: 'developerId', model: 'User', select: 'fullName email role' },
    ]);

    if (!residenceDraft) {
      throw new NotFoundException(`residenceDraft with ID ${residenceDraftId}`);
    }

    //Todo: Get releted draft unit's

    return residenceDraft;
  }
}
