import { Module } from '@nestjs/common';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchmakingThread, MatchmakingThreadSchema } from './schema/matchmakingThread.schema';
import { MatchmakingThreadRepository } from './matchmakingThread.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MatchmakingThread.name, schema: MatchmakingThreadSchema }]),
  ],
  controllers: [MatchmakingController],
  providers: [
    MatchmakingService,
    MatchmakingThreadRepository
  ]
})

export class MatchmakingModule {}
