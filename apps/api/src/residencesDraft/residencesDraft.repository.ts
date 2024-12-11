import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceDraft } from './schema/residencesDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { DeletionStatus } from 'src/unit/enum/unit-enum';
import { ResidenceStatus } from 'src/residences/enum/residence-enum';

@Injectable()
export class ResidenceDraftRepository extends BaseRepository<ResidenceDraft> {
  constructor(
    @InjectModel(ResidenceDraft.name) private readonly residenceDraftModel: Model<ResidenceDraft>
  ) {
    super(residenceDraftModel);
  }
  async findByIdInDetail(residenceDraftId: string): Promise<any> {
    const residenceDraft: any = await this.residenceDraftModel.findById(residenceDraftId).populate([
      { path: 'residenceTypeIds', select: 'type', model: 'ResidenceType' },
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
      {
        path: 'nearbyAmenities.amenitiesList',
        model: 'Amenity',
        populate: {
          path: 'upload.imageId',
          model: 'Upload',
        },
      },
      { path: 'nearbyAmenities.highlightedAmenities.amenityId', select: 'name', model: 'Amenity' },
      {
        path: 'nearbyAmenities.highlightedAmenities.imageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'createdById', model: 'User', select: 'fullName email role' },
      { path: 'updatedById', model: 'User', select: 'fullName email role' },
      { path: 'developerId', model: 'User', select: 'fullName email role' },
    ]);

    if (!residenceDraft) {
      throw new NotFoundException(`residenceDraft with ID ${residenceDraftId}`);
    }

    return residenceDraft;
  }

  async findByKeyInDetail(residenceKey: string): Promise<any> {
    const residenceDraft: any = await this.residenceDraftModel
    .findOne({ key: residenceKey, isDeleted: { $ne: DeletionStatus.DELETED }, isDraft: true , status: { $in: [ResidenceStatus.PENDING, ResidenceStatus.DRAFT, ResidenceStatus.ACTIVE]} })
    .sort({ createdAt: -1 })
    .limit(1)
    .populate([
      { path: 'residenceTypeIds', select: 'type', model: 'ResidenceType' },
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
        {
          path: 'nearbyAmenities.amenitiesList',
          model: 'Amenity',
          populate: {
            path: 'upload.imageId',
            select: 'originalFileKey fileKey url mimeType',
            model: 'Upload',
          },
        },
        {
          path: 'nearbyAmenities.highlightedAmenities.amenityId',
          model: 'Amenity',
          populate: {
            path: 'upload.imageId',
            select: 'originalFileKey fileKey url mimeType',
            model: 'Upload',
          },
        },
        {
          path: 'nearbyAmenities.highlightedAmenities.imageId',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        { path: 'createdById', model: 'User', select: 'fullName email role' },
        {
          path: 'developerId',
          model: 'User',
          select:
            '_id fullName email role loginAddress loginTime contactInfo contactPersonInfo companyInfo',
        },
        { path: 'highestRankingCategoryId', model: 'RankingCategory', select: 'title' },
    ]);

    if (!residenceDraft) {
      throw new NotFoundException(`residenceDraft with key ${residenceKey}`);
    }

    //Todo: Get releted draft unit's

    return residenceDraft;
  }
}
