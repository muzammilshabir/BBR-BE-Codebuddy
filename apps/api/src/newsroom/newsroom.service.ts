import { Injectable } from '@nestjs/common';
import { NewsroomRepository } from './newsroom.repository';
import { Newsroom } from './schema/newsroom.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NewsroomService {

  constructor(
    @InjectModel(Newsroom.name) private readonly newsroomModel: Model<Newsroom>,
    private readonly newsroomRepository: NewsroomRepository,
  ) {}


}
