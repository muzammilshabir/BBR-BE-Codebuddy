import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { S3ClientFactory } from 'src/upload/s3.client';

const BUCKET_NAME = 'bbr-prod-s3';
const DESTINATION_BUCKET_NAME = 'bbr-prod-assets';
const LOCAL_DOWNLOAD_DIR = '/tmp/bbr-images';

@Processor('image-processing') // Define the queue
export class ImageProcessor extends WorkerHost {
  private readonly s3Client: S3Client;

  constructor(private readonly s3ClientFactory: S3ClientFactory) {
    super();
    this.s3Client = this.s3ClientFactory.createClient();
  }

  async process(job: Job) {
    console.log(`Processing batch of ${job.data.images.length} images...`);

    const downloadedFiles = await this.downloadImages(job.data.images);
    const convertedFiles = await this.convertFilesToWebP(downloadedFiles);
    await this.uploadFilesToS3(convertedFiles);
    this.cleanUpLocalFiles();

    console.log(`Batch of ${job.data.images.length} images processed.`);
  }

  @OnWorkerEvent('completed')
  onJobCompleted(job: Job) {
    console.log(`✅ Job ${job.id} completed successfully.`);
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, err: Error) {
    console.error(`❌ Job ${job.id} failed:`, err);
  }

  async downloadImages(imageKeys: string[]): Promise<string[]> {
    console.log('Downloading images...');
    const files: string[] = [];

    for (const key of imageKeys) {
      const localFilePath = path.join(LOCAL_DOWNLOAD_DIR, key);
      const localDir = path.dirname(localFilePath);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      const getObjectCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
      const { Body } = await this.s3Client.send(getObjectCommand);

      if (Body instanceof Readable) {
        const fileStream = fs.createWriteStream(localFilePath);
        await pipeline(Body, fileStream);
        files.push(localFilePath);
      }
    }

    return files;
  }

  async convertFilesToWebP(files: string[]): Promise<string[]> {
    console.log('Converting images to WebP...');
    const convertedFiles: string[] = [];

    for (const file of files) {
      if (file.endsWith('.webp')) {
        convertedFiles.push(file);
        continue;
      }

      const webpFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      await sharp(file).webp().toFile(webpFile);
      convertedFiles.push(webpFile);
    }

    return convertedFiles;
  }

  async uploadFilesToS3(files: string[]) {
    console.log('Uploading images to destination bucket...');
    for (const file of files) {
      const relativePath = file.replace(LOCAL_DOWNLOAD_DIR, '').replace(/\\/g, '/');
      const key = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      const fileContent = fs.readFileSync(file);

      const command = new PutObjectCommand({
        Bucket: DESTINATION_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: 'image/webp',
      });

      await this.s3Client.send(command);
    }
  }

  cleanUpLocalFiles() {
    console.log('Cleaning up local files...');
    fs.rmdirSync(LOCAL_DOWNLOAD_DIR, { recursive: true });
  }
}
