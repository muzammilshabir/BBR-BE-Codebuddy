import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Residence } from './schema/residences.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class ResidenceRepository extends BaseRepository<Residence> {
  constructor(@InjectModel(Residence.name) private readonly residenceModel: Model<Residence>) {
    super(residenceModel);
  }

  async findByIdInDetail(residenceId: string): Promise<any> {
    let residence: any = await this.residenceModel.findById(residenceId).populate([
      { path: 'residenceTypeId', select: 'type' },
      { path: 'cityId', select: 'name type countryId' },
      { path: 'countryId', select: 'name type' },
      { path: 'associatedBrandId', select: 'name' },
      { path: 'residenceKeyFeatures.featureIds', select: 'name', model: 'ResidenceFeature' },
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

    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId}`);
    }

    residence = residence.toObject();
    const units = await this.residenceModel.aggregate([
      { $match: { _id: new Types.ObjectId(residenceId) } },

      {
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: 'residenceId',
          as: 'units',
        },
      },

      {
        $project: {
          units: 1,
        },
      },
    ]);

    residence.units = units.length > 0 ? units[0].units : [];
    return residence;
  }
}
