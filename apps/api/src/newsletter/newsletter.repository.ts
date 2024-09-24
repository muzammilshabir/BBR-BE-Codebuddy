import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter } from './schema/newsletter.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class NewsletterRepository extends BaseRepository<Newsletter> {
  constructor(@InjectModel(Newsletter.name) private readonly newsletterModel: Model<Newsletter>) {
    super(newsletterModel);
  }

  async findById(newsletterId: string): Promise<Newsletter> {
    return this.newsletterModel.findById(newsletterId);
  }
}