import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { CometChatService } from 'src/users/comet-chat.service';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [],
  controllers: [ConversationsController],
  providers: [CometChatService, ConversationsService],
})
export class ConversationsModule {}
