import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { MatchmakingThread } from './schema/matchmakingThread.schema';

@Injectable()
export class MatchmakingThreadRepository extends BaseRepository<MatchmakingThread> {
  constructor(
    @InjectModel(MatchmakingThread.name) private readonly matchmakingThreadModel: Model<MatchmakingThread>
  ) {
    super(matchmakingThreadModel);
  }

}
