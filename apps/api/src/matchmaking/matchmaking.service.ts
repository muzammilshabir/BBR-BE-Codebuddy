import { Injectable } from '@nestjs/common';
import { MatchmakingThreadRepository } from './matchmakingThread.repository';
import OpenAI from 'openai';
import { MatchmakingPreferencesDto } from './dto/updatePreferences.dto';

@Injectable()
export class MatchmakingService {
  private openai: OpenAI;

  constructor(private readonly matchmakingThreadRepository: MatchmakingThreadRepository) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createSession() {
    try {
      const thread = await this.openai.beta.threads.create();
      console.log(thread);

      await this.matchmakingThreadRepository.create({
        sessionId: thread.id,
      });

      return {
        sessionId: thread.id,
      };
    } catch (error) {
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

  async updatePreferences(matchmakingPreferencesDto: MatchmakingPreferencesDto, sessionId: string) {
    const thread = await this.matchmakingThreadRepository.find({
      sessionId,
      isDeleted: false,
    });

    const filter = { sessionId };
    const updateDto = {
      $set: {
        preferences: {
          ...thread.preferences,
          ...matchmakingPreferencesDto,
        },
      },
    };

    const updatedThread = await this.matchmakingThreadRepository.updateWithFilter(
      filter,
      updateDto
    );

    return updatedThread;
  }
}
