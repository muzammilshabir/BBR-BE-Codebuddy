import { Injectable, Logger } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';

@Injectable()
export class UploadSeeder extends AbstractSeeder {
  public name = UploadSeeder.name;
  private readonly logger = new Logger(UploadSeeder.name);

  constructor(private readonly uploadRepository: UploadRepository) {
    super();
  }

  async seed() {
    try {
      const uploads = [
        {
          originalFileKey: 'staff.png',
          fileKey: 'public/staff_5e8454866b106d8d.png',
          url: 'https://d1gi1hhecs55o9.cloudfront.net/public/staff_5e8454866b106d8d.png',
          mimeType: 'image/png',
          size: 32801,
          driver: 'AWS_S3',
          createdById: '60d5f485f7c6a4b2b8e8b5f7', // Example ObjectId
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          originalFileKey: 'document.pdf',
          fileKey: 'public/documents/5e8454866b106d8d.pdf',
          url: 'https://d1gi1hhecs55o9.cloudfront.net/public/documents/5e8454866b106d8d.pdf',
          mimeType: 'application/pdf',
          size: 1048576,
          driver: 'AWS_S3',
          createdById: '60d5f485f7c6a4b2b8e8b5f8', // Example ObjectId
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const upload of uploads) {
        await this.uploadRepository.upsert({ fileKey: upload.fileKey }, upload);
      }

      this.logger.log('Seeding uploads completed successfully.');
    } catch (error) {
      this.logger.error('Error seeding uploads:', error);
    }
  }
}