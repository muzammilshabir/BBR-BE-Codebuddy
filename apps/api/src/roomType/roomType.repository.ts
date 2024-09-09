import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomType } from './schema/roomType.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class RoomTypeRepository extends BaseRepository<RoomType> {
  constructor(@InjectModel(RoomType.name) private readonly roomTypeModel: Model<RoomType>) {
    super(roomTypeModel);
  }
  async findByType(type: string): Promise<RoomType> {
    return this.roomTypeModel.findOne({ type });
  }
}
