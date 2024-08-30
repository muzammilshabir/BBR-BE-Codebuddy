import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UploadRepository } from './upload.repository';
import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ServiceConfig } from '../config';
import VolatileFile from 'formidable/VolatileFile';
import { PassThrough, Readable, Writable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import * as shortUUID from 'short-uuid';
import { formidableOptions } from './formidable.config';
import { S3ClientFactory } from './s3.client';
import formidable, { File } from 'formidable';
import { Request } from 'express';
import { Types } from 'mongoose';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
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
      let metadata: { referenceId?: Types.ObjectId; referenceType?: string } = {};

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
            url: `https://${config.s3.bucket}.${config.s3.endpoint}/${response.Key}`,
            mimeType: formidableFile.mimetype,
            size: formidableFile.size,
            driver: 'S3',
            createdById: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5f7'), // Assuming you have user authentication in place
            metadata,
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

      form.parse(req, (error, fields) => {
        if (error) {
          reject(error);
          return;
        }

        // Extract and parse metadata from fields
        if (fields.metadata && Array.isArray(fields.metadata)) {
          try {
            const parsedMetadata = JSON.parse(fields.metadata[0]);
            metadata.referenceId = new Types.ObjectId(parsedMetadata.referenceId);
            metadata.referenceType = parsedMetadata.referenceType;
          } catch (parseError) {
            this.logger.log('Error parsing metadata', parseError);
            metadata = {}; // Default to empty metadata if parsing fails
          }
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

  async downloadFile(publicUrl: string, userId: string) {
    try {
      const { passThrough, filename, contentType, size } = await this.downloadImage(publicUrl);
      return await this.uploadImageToS3(passThrough, filename, contentType, size, userId);
    } catch (error) {
      console.error(`Failed to download image from URL: ${publicUrl}`, error.message);
      return null;
    }
  }
  async downloadImage(url: string): Promise<any> {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      const passThrough = new PassThrough();
      response.data.pipe(passThrough);

      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1] || shortUUID.generate(); // Default to a unique ID if filename is not present

      // Extract Content-Type and Content-Length from response headers
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const contentLength = parseInt(response.headers['content-length'], 10) || 0;

      return { passThrough, filename: fileName, contentType, size: contentLength };
    } catch (error) {
      this.logger.error(`Error downloading image from URL: ${url}`, error.message);
    }
  }

  async uploadImageToS3(
    passThrough: PassThrough,
    filename: string,
    contentType: string,
    size: number,
    userId: string
  ) {
    const client = this.s3Client;
    const config = this.config;

    return new Promise((resolve, reject) => {
      const upload = new Upload({
        client,
        params: {
          Bucket: config.s3.bucket,
          Key: filename,
          ContentType: contentType,
          Body: passThrough,
        },
      });

      upload.done().then(async (response) => {
        const fileDocument = {
          originalFileKey: filename,
          fileKey: response.Key,
          url: `https://${config.s3.bucket}.${config.s3.endpoint}/${response.Key}`,
          mimeType: contentType,
          size: size,
          driver: 'S3',
          createdById: new Types.ObjectId(userId),
        };
        // Store the file metadata in the database
        const storedFile = await this.uploadRepository.create(fileDocument);
        resolve(storedFile);
      });

      passThrough.on('end', () => {
        this.logger.log('Image has been uploaded to S3');
      });

      passThrough.on('error', (error) => {
        reject(error);
      });
    });
  }

  async saveFileTemp(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Key: key,
      Bucket: this.config.s3.bucket,
    });

    try {
      const response = await this.s3Client.send(command);
      const tempFilePath = path.join(os.tmpdir(), key);
      const writeStream = fs.createWriteStream(tempFilePath);

      if (response.Body instanceof Readable) {
        response.Body.pipe(writeStream);
      }

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      this.logger.log(`File saved temporarily at ${tempFilePath}`);

      return tempFilePath;
    } catch (error) {
      this.logger.error(`Error retrieving file from S3: ${error.message}`);
      throw new Error('Failed to save file temporarily');
    }
  }

  async getfileById(fileId: string): Promise<any> {
    const file = await this.uploadRepository.findOne(fileId);
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }
    return file;
  }

  async deleteFiles(uploadIds: string[]) {
    const files = await this.uploadRepository.findAllByIds(uploadIds);

    const deletePromises = files.map(async (file: any) => {
      try {
        // Delete the file from the S3 bucket
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.config.s3.bucket,
            Key: file.fileKey,
          })
        );

        await this.uploadRepository.update(file._id, { isDeleted: true });

        this.logger.log(`Successfully deleted file: ${file.fileKey}`);
      } catch (error) {
        this.logger.error(`Failed to delete file: ${file.fileKey}`, error);
        throw new BadRequestException(`Failed to delete file with key ${file.fileKey}`);
      }
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    return { message: 'Files deleted successfully.' };
  }
}
