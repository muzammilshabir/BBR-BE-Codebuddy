import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { S3ClientFactory } from 'src/upload/s3.client';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class BulkImageConversionService {
  private readonly s3Client: S3Client;
  private readonly BUCKET_NAME = 'bbr-prod-s3';
  private readonly BATCH_SIZE = 50; // Number of images per batch
  private readonly imageQueue: Queue;

  constructor(private readonly s3ClientFactory: S3ClientFactory) {
    this.s3Client = this.s3ClientFactory.createClient();
    this.imageQueue = new Queue('image-processing', {
      connection: {
        host: process.env.APP_REDIS_HOST,
        port: Number(process.env.APP_REDIS_PORT),
        username: process.env.APP_REDIS_USER,
        password: process.env.APP_REDIS_PASSWORD,
      },
    });
  }

  async enqueueImageProcessingJobs(prefix?: string) {
    console.log('Fetching image keys from S3...');
    const allKeys = await this.getAllImageKeysFromS3(prefix);

    const batches = this.chunkArray(allKeys, this.BATCH_SIZE);
    for (const batch of batches) {
      await this.imageQueue.add('convert-images', { images: batch });
    }

    console.log(`Queued ${batches.length} jobs for processing.`);
  }

  private async getAllImageKeysFromS3(prefix?: string): Promise<string[]> {
    console.log('Fetching image keys from S3...');
    const imageKeys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const { Contents, IsTruncated, NextContinuationToken } = await this.s3Client.send(command);

      for (const obj of Contents || []) {
        if (obj.Key && obj.Key.match(/\.(jpg|jpeg|png|webp)$/i)) {
          imageKeys.push(obj.Key);
        }
      }

      continuationToken = IsTruncated ? NextContinuationToken : undefined;
    } while (continuationToken);

    return imageKeys;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }
}
