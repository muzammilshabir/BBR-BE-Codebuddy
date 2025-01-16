import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchedule, MessageScheduleSchema } from './schema/message-schedule.schema';
import { MessageScheduleService } from './message-schedule.service';
import { ServiceConfig } from '../config';
import { MessageScheduleController } from './message-schedule.controller';
import { CometChatService } from 'src/users/comet-chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MessageSchedule.name, schema: MessageScheduleSchema }]),
  ],
  controllers: [MessageScheduleController],
  providers: [MessageScheduleService, ServiceConfig, CometChatService],
})
export class MessageScheduleModule {}
