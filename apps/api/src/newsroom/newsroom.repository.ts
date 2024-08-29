import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsroom } from './schema/newsroom.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class NewsroomRepository extends BaseRepository<Newsroom> {
  constructor(@InjectModel(Newsroom.name) private readonly newsroomModel: Model<Newsroom>) {
    super(newsroomModel);
  }

  async findById(newsroomPostId: string): Promise<Newsroom> {
    return this.newsroomModel.findById(newsroomPostId);
  }
}