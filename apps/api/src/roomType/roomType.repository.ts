import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoomType } from './schema/roomType.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { DeletionStatus } from '../unit/enum/unit-enum';

@Injectable()
export class RoomTypeRepository extends BaseRepository<RoomType> {
  constructor(@InjectModel(RoomType.name) private readonly roomTypeModel: Model<RoomType>) {
    super(roomTypeModel);
  }
  async findByType(type: string): Promise<RoomType> {
    return this.roomTypeModel.findOne({ type });
  }
  async findByIdInDetail(roomTypeId: string): Promise<any> {
    const roomType = await this.roomTypeModel
      .findOne({ _id: new Types.ObjectId(roomTypeId), isDeleted: { $ne: DeletionStatus.DELETED } })
      .populate([
        {
          path: 'upload.ImageId',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
      ]);

    return roomType;
  }
}
