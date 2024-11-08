import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GeographicalAreas } from './schema/geographicalAreas.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '../../../../packages/api-core/modules/exceptions';
import { DeletionStatus } from '../unit/enum/unit-enum';

@Injectable()
export class GeographicalAreasRepository extends BaseRepository<GeographicalAreas> {
  constructor(
    @InjectModel(GeographicalAreas.name)
    private readonly geographicalAreasModel: Model<GeographicalAreas>
  ) {
    super(geographicalAreasModel);
  }

  async findByIdInDetail(geographicalAreasId: string): Promise<any> {
    const geographicalAreas = await this.geographicalAreasModel
      .findOne({
        _id: new Types.ObjectId(geographicalAreasId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      })
      .populate([
        { path: 'createdBy', model: 'User', select: 'fullName email role' },
        { path: 'updatedBy', model: 'User', select: 'fullName email role' },
        { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      ]);

    if (!geographicalAreas) {
      throw new NotFoundException(`geographicalAreas with ID ${geographicalAreasId}`);
    }

    return geographicalAreas;
  }
}
