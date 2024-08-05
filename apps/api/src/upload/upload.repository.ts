import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Upload } from './schema/upload.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class UploadRepository extends BaseRepository<Upload> {
  constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<Upload>) {
    super(uploadModel);
  }
}
