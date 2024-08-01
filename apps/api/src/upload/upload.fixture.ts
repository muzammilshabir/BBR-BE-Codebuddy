import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Upload } from './schema/upload.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class UploadFixture extends AbstractFixture {
  constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<Upload>) {
    super();
  }

  name = UploadFixture.name;
  static UPLOAD_1='UPLOAD_1';
  static UPLOAD_2='UPLOAD_2';

  async load(): Promise<any> {
    const upload1 = await this.uploadModel.create({
      originalFileKey: 'staff.png',
      fileKey: 'public/staff_5e8454866b106d8d.png',
      url: 'https://d1gi1hhecs55o9.cloudfront.net/public/staff_5e8454866b106d8d.png',
      mimeType: 'image/png',
      size: 32801,
      driver: 'AWS_S3',
      createdById: '60d5f485f7c6a4b2b8e8b5f7', // Example ObjectId
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const upload2 = await this.uploadModel.create({
      originalFileKey: 'staff.png',
      fileKey: 'public/staff_767b306d2d78c079.png',
      url: 'https://d1gi1hhecs55o9.cloudfront.net/public/staff_767b306d2d78c079.png',
      mimeType: 'image/png',
      size: 32801,
      driver: 'AWS_S3',
      createdById: '60d5f485f7c6a4b2b8e8b5f7', // Example ObjectId
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.addReference(UploadFixture.UPLOAD_1, upload1);
    this.addReference(UploadFixture.UPLOAD_2, upload2);

    return await this.uploadModel.find()
  }
}