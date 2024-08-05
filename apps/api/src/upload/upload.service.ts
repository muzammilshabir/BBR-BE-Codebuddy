import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { S3Client } from '@aws-sdk/client-s3';
import { ServiceConfig } from 'src/config';
import VolatileFile from 'formidable/VolatileFile';
import { PassThrough, Writable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import * as shortUUID from 'short-uuid';
import { formidableOptions } from './formidable.config';
import { S3ClientFactory } from './s3.client';
import formidable, { File } from 'formidable';
import { Request } from 'express';
@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(UploadService.name);
  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly config: ServiceConfig,
    private readonly s3ClientFactory: S3ClientFactory
  ) {
    this.s3Client = this.s3ClientFactory.createClient();
  }

  async uploadFile(req: Request) {
    const client = this.s3Client;
    const config = this.config;

    return new Promise((resolve, reject) => {
      const s3Uploads = [];

      function fileWriteStreamHandler(file: VolatileFile): Writable {
        const formidableFile = file as unknown as File;
        const body = new PassThrough();
        const upload = new Upload({
          client,
          params: {
            Bucket: config.s3.bucket,
            Key: formidableFile.newFilename,
            ContentType: formidableFile.mimetype,
            Body: body,
          },
        });
        const uploadRequest = upload.done().then(async (response) => {
          const fileDocument = {
            originalFileKey: formidableFile.originalFilename,
            fileKey: response.Key,
            // url: `https://${config.s3.bucket}.${config.s3.endpoint}/${response.Key}`,
            url: `${config.s3.cdnUrl}/${response.Key}`,
            mimeType: formidableFile.mimetype,
            size: formidableFile.size,
            driver: 'S3',
            createdById: '60d5f485f7c6a4b2b8e8b5f7', // Assuming you have user authentication in place
          };
          return fileDocument;
        });
        s3Uploads.push(uploadRequest);
        return body;
      }

      const form = formidable({
        ...formidableOptions,
        fileWriteStreamHandler,
        filename: shortUUID.generate,
      });
      form.once('end', () => {
        this.logger.log('All files have been uploaded');
      });
      form.parse(req, (error) => {
        if (error) {
          reject(error);
          return;
        }
        Promise.all(s3Uploads)
          .then(async (files) => {
            // Store all files in the database and wait for the operation to complete
            const storedFiles = await Promise.all(
              files.map((file) => this.uploadRepository.create(file))
            );
            resolve(storedFiles);
          })
          .catch(reject);
      });
    });
  }

  mapError(error) {
    const code = error.Code || error.code;
    this.logger.error(error);

    switch (code) {
      case 'InvalidAccessKeyId':
        throw new BadRequestException('Invalid AWS access key ID');
      case 'SignatureDoesNotMatch':
        throw new BadRequestException('Invalid AWS USER secret key');
      case 'NoSuchBucket':
        throw new BadRequestException('Invalid AWS bucket');
      case 'ENOTFOUND':
        throw new BadRequestException('Invalid AWS region');
      default:
        throw new BadRequestException('Error uploading file');
    }
  }
}
