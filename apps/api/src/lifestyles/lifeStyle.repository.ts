import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LifeStyle } from './schema/lifeStyle.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { DeletionStatus } from 'src/unit/enum/unit-enum';

@Injectable()
export class LifeStyleRepository extends BaseRepository<LifeStyle> {
  constructor(@InjectModel(LifeStyle.name) private readonly lifeStyleModel: Model<LifeStyle>) {
    super(lifeStyleModel);
  }

  async findByIdInDetail(lifeStyleId: string): Promise<any> {
    const lifeStyle: any = await this.lifeStyleModel
      .findOne({ _id: new Types.ObjectId(lifeStyleId), isDeleted: { $ne: DeletionStatus.DELETED } })
      .populate([
        { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' }
      ]);

    return lifeStyle;
  }
}
