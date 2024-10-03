import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnitDraft } from './schema/unitDraft.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class UnitDraftRepository extends BaseRepository<UnitDraft> {
  constructor(@InjectModel(UnitDraft.name) private readonly unitDraftModel: Model<UnitDraft>) {
    super(unitDraftModel);
  }
  async findByIdInDetail(unitId: string): Promise<UnitDraft> {
    return this.unitDraftModel.findById(unitId).populate([
      { path: 'unitId' },
      { path: 'visuals.mainPhotos', model: 'Upload' },
      { path: 'visuals.mainGalleryPhotos', model: 'Upload' },
      { path: 'visuals.secondGalleryPhotos', model: 'Upload' },
      { path: 'visuals.videoTour', model: 'Upload' },
      { path: 'rooms.roomTypeId', model: 'RoomType', select: 'type' },
      {
        path: 'unitKeyFeatures.residenceServices.serviceTypeId',
        model: 'ResidenceService',
        select: 'type',
      },
      { path: 'createdById', model: 'User', select: 'fullName email role' },
      { path: 'updatedById', model: 'User', select: 'fullName email role' },
    ]);
  }
}
